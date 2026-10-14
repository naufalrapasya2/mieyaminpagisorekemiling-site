const express = require('express');
const router = express.Router();
const db = require('../db/db');

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
    res.render('receipt',{ orderId, customer_name, items, subtotal, ship, fee, total, payment_method });
  });
});

// Redirect to ShopeeFood
router.get('/order/shopee', (req,res)=>{
  res.redirect('https://spf.shopee.co.id/W7Pki1FGq');
});

module.exports = router;
