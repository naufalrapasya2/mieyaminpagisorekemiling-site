const express = require('express');
const router = express.Router();
const db = require('../db/db');
const PDFDocument = require('pdfkit');

// Home - list categories and featured items
router.get('/', (req,res)=>{
  db.all(`SELECT id,name FROM categories ORDER BY name`, [], (err,cats)=>{
    if(err) return res.status(500).send('DB error');
    db.all(`SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id=c.id LIMIT 50`, [], (err,items)=>{
      if(err) return res.status(500).send('DB error');
      res.render('home',{ categories:cats, items, shopUrl:'https://spf.shopee.co.id/W7Pki1FGq' });
    });
  });
});

// Menu by category
router.get('/category/:id', (req,res)=>{
  const id = req.params.id;
  db.all(`SELECT * FROM menu_items WHERE category_id = ?`, [id], (err,items)=>{
    if(err) return res.status(500).send('DB error');
    res.render('category',{ items });
  });
});

// Checkout (simple)
router.post('/checkout', (req,res)=>{
  const { customer_name, customer_phone, customer_address, items_json, shipping, service_fee, payment_method } = req.body;
  const items = JSON.parse(items_json || '[]');
  const subtotal = items.reduce((s,it)=>s + (+it.price * +it.qty),0);
  const ship = parseInt(shipping) || 0;
  const fee = parseInt(service_fee) || 0;
  const total = subtotal + ship + fee;
  db.run(`INSERT INTO orders (customer_name,customer_phone,customer_address,items,subtotal,shipping,service_fee,total,payment_method) VALUES (?,?,?,?,?,?,?,?,?)`, [customer_name,customer_phone,customer_address,JSON.stringify(items),subtotal,ship,fee,total,payment_method], function(err){
    if(err) return res.status(500).send('DB error');
    const orderId = this.lastID;
    // If payment method is card, try to initiate Midtrans (if configured) -> otherwise render receipt with instruction
    if(payment_method && payment_method.toLowerCase().includes('kartu')){
      if(process.env.MIDTRANS_SERVER_KEY){
        try{
          const midtransClient = require('midtrans-client');
          const snap = new midtransClient.Snap({ isProduction: !!process.env.MIDTRANS_PRODUCTION, serverKey: process.env.MIDTRANS_SERVER_KEY });
          const transactionDetails = {
            transaction_details: {
              order_id: `MIEYAMIN-${orderId}-${Date.now()}`,
              gross_amount: total
            },
            item_details: items.map(it=>({ id: String(it.id), price: it.price, quantity: it.qty, name: it.name }))
          };
          snap.createTransaction(transactionDetails)
            .then(transaction => {
              // transaction.redirect_url
              res.render('payment_midtrans',{ orderId, redirect_url: transaction.redirect_url });
            }).catch(err=>{
              console.error('Midtrans error',err);
              res.render('receipt',{ orderId, customer_name, items, subtotal, ship, fee, total, payment_method, notice:'Midtrans error - silakan pilih metode lain atau kontak admin.' });
            });
          return;
        }catch(e){
          console.error('Midtrans init error',e);
        }
      }
    }

    res.render('receipt',{ orderId, customer_name, items, subtotal, ship, fee, total, payment_method });
  });
});

// Redirect to ShopeeFood
router.get('/order/shopee', (req,res)=>{
  res.redirect('https://spf.shopee.co.id/W7Pki1FGq');
});

// Download receipt as PDF
router.get('/receipt/:id/pdf', (req,res)=>{
  const id = req.params.id;
  db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err,order)=>{
    if(err || !order) return res.status(404).send('Order tidak ditemukan');
    const items = JSON.parse(order.items || '[]');
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-disposition', `attachment; filename=receipt-${id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text('MIE YAMIN PAGI SORE KEMILING', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order.id}`);
    doc.text(`Nama: ${order.customer_name}`);
    doc.text(`Telepon: ${order.customer_phone || '-'} `);
    doc.text(`Alamat: ${order.customer_address || '-'} `);
    doc.text(`Metode Pembayaran: ${order.payment_method || '-'} `);
    doc.moveDown();

    doc.text('Rincian Pesanan:');
    const tableTop = doc.y + 10;
    items.forEach(it=>{
      doc.text(`${it.name} x${it.qty}  Rp.${(it.price*it.qty).toLocaleString('id-ID')}`);
    });
    doc.moveDown();
    doc.text(`Subtotal: Rp.${order.subtotal.toLocaleString('id-ID')}`);
    doc.text(`Ongkir: Rp.${order.shipping.toLocaleString('id-ID')}`);
    doc.text(`Biaya Layanan: Rp.${order.service_fee.toLocaleString('id-ID')}`);
    doc.moveDown();
    doc.fontSize(14).text(`TOTAL: Rp.${order.total.toLocaleString('id-ID')}`);

    doc.moveDown();
    doc.fontSize(10).text('Terima kasih telah memesan di Mie Yamin Pagi Sore Kemiling.');
    doc.end();
  });
});

module.exports = router;
