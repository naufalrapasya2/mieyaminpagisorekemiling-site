const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcryptjs');

// middleware
function ensureAdmin(req,res,next){
  if(req.session && req.session.user && req.session.user.role === 'admin') return next();
  res.redirect('/admin/login');
}

router.get('/login',(req,res)=>{
  res.render('login',{ message: null });
});

router.post('/login',(req,res)=>{
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err,user)=>{
    if(err || !user) return res.render('login',{ message: 'Email atau password salah' });
    if(!bcrypt.compareSync(password, user.password)) return res.render('login',{ message: 'Email atau password salah' });
    req.session.user = { id: user.id, email: user.email, role: user.role };
    res.redirect('/admin');
  });
});

router.get('/logout',(req,res)=>{
  req.session.destroy(()=>res.redirect('/admin/login'));
});

// Forgot password: simple flow to change password after providing email (no SMTP)
router.get('/forgot',(req,res)=>{
  res.render('forgot',{ message: null });
});
router.post('/forgot', (req,res)=>{
  const { email, new_password } = req.body;
  if(!email || !new_password) return res.render('forgot',{ message: 'Isi email dan password baru' });
  const hashed = bcrypt.hashSync(new_password,10);
  db.run(`UPDATE users SET password = ? WHERE email = ?`, [hashed,email], function(err){
    if(err) return res.render('forgot',{ message: 'Terjadi kesalahan' });
    if(this.changes===0) return res.render('forgot',{ message: 'Email tidak ditemukan' });
    res.render('forgot',{ message: 'Password berhasil direset. Silakan login.' });
  });
});

// Admin dashboard
router.get('/', ensureAdmin, (req,res)=>{
  db.all(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`, [], (err,orders)=>{
    if(err) return res.status(500).send('DB error');
    res.render('admin/dashboard',{ user:req.session.user, orders });
  });
});

// Menu CRUD
router.get('/menus', ensureAdmin, (req,res)=>{
  db.all(`SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id=c.id ORDER BY m.id`, [], (err,items)=>{
    if(err) return res.status(500).send('DB error');
    db.all(`SELECT * FROM categories`, [], (err,cats)=>{
      res.render('admin/menus',{ items, cats });
    });
  });
});

router.post('/menus', ensureAdmin, (req,res)=>{
  const { category_id, name, description, price } = req.body;
  db.run(`INSERT INTO menu_items (category_id,name,description,price) VALUES (?,?,?,?)`, [category_id||null,name,description,price], function(err){
    if(err) return res.status(500).send('DB error');
    res.redirect('/admin/menus');
  });
});

router.post('/menus/delete', ensureAdmin, (req,res)=>{
  const { id } = req.body;
  db.run(`DELETE FROM menu_items WHERE id = ?`, [id], function(err){ if(err) return res.status(500).send('DB error'); res.redirect('/admin/menus'); });
});

module.exports = router;
