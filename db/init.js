const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'database.sqlite');

// Ensure data directory
const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

function run(sql, params = []){
  return new Promise((res, rej) => db.run(sql, params, function(err){ if(err) rej(err); else res(this); }));
}

async function init(){
  try{
    await run(`PRAGMA foreign_keys = ON;`);

    await run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);

    await run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);

    await run(`CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT,
      description TEXT,
      price INTEGER,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
    );`);

    await run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      customer_phone TEXT,
      customer_address TEXT,
      items TEXT, -- json
      subtotal INTEGER,
      shipping INTEGER,
      service_fee INTEGER,
      total INTEGER,
      payment_method TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);

    // create default admin
    const adminEmail = 'admin@mieyamin.local';
    const adminPassword = 'Admin123!';
    const hashed = bcrypt.hashSync(adminPassword, 10);

    await run(`INSERT OR IGNORE INTO users (email,password,name,role) VALUES (?,?,?,?);`, [adminEmail, hashed, 'Admin Mie Yamin', 'admin']);

    // seed categories and menu
    const categories = [
      'MIE YAMIN FAVORIT',
      'MIE YAMIN KOMPLIT',
      'MIE AYAM',
      'PAKET HEMAT',
      'PAKET KEROYOKAN',
      'PAKET SIMPLE',
      'PAKET KOMBO YAMIN',
      'PAKET YAMIN IDOLA',
      'PAKET KEKINIAN',
      'ANEKA TOPING',
      'MINUMAN SEGER',
      'AIR MINERAL',
      'ALPUKAT KOCOK'
    ];

    const categoryIds = {};
    for(const c of categories){
      await run(`INSERT OR IGNORE INTO categories (name) VALUES (?);`, [c]);
      // get id
      await new Promise((resolve, reject)=>{
        db.get(`SELECT id FROM categories WHERE name = ?`, [c], (err,row)=>{ if(err) reject(err); else{ categoryIds[c]=row.id; resolve(); }});
      });
    }

    const menuItems = [
      {cat:'MIE YAMIN FAVORIT', name:'MIE YAMIN MANIS', desc:'Mie Yamin Manis paling laris dan disukai banyak orang', price:25900, img:'https://via.placeholder.com/600x400?text=Mie+Yamin+Manis'},
      {cat:'MIE YAMIN FAVORIT', name:'MIE YAMIN ASIN', desc:'Mie Yamin Bandung Asin, Mie kenyal dengan bumbu asin khas bandung yang ringan namun kaya rasa, disajikan dengan ayam cincang, pangsit goreng dan kuah kaldu yang hangat', price:24900, img:'https://via.placeholder.com/600x400?text=Mie+Yamin+Asin'},
      {cat:'MIE YAMIN FAVORIT', name:'MIE YAMIN PEDAS', desc:'Mie Yamin Khas dengan cita rasa manis-gurih, dipadukan sambal spesial racikan Pagi Sore yang pedas menggigit.', price:26900, img:'https://via.placeholder.com/600x400?text=Mie+Yamin+Pedas'},
      {cat:'MIE YAMIN KOMPLIT', name:'MIE YAMIN KOMPLIT', desc:'Mie kenyal disajikan dengan ayam cincang, pangsit goreng, pangsit rebus dan kuah gurih', price:36900, img:'https://via.placeholder.com/600x400?text=Mie+Yamin+Komplit'},
      {cat:'MIE YAMIN KOMPLIT', name:'MIE YAMIN KEJU BAKAR', desc:'Mie Yamin dengan ayam cincang dan Keju di bakar meleleh', price:27900, img:'https://via.placeholder.com/600x400?text=Keju+Bakar'},
      {cat:'MIE YAMIN KOMPLIT', name:'MIE YAMIN PANGSIT', desc:'Mie Yamin dengah kuah gurih, disajikan Bersama pangsit lembut berisi daging berbumbu.', price:27900, img:'https://via.placeholder.com/600x400?text=Mie+Yamin+Pangsit'},
      {cat:'MIE YAMIN KOMPLIT', name:'MIE YAMIN BAKSO', desc:'Mie Yamin gurih dengan sentuhan manis khas, disajikan dengan ayam cincang, pangsit goreng renyah dan bakso sapi pilihan', price:27900, img:'https://via.placeholder.com/600x400?text=Mie+Yamin+Bakso'},
      {cat:'MIE AYAM', name:'MIE AYAM + CEKER', desc:'Mie kenyal dengan topping berbumbu gurih, dilengkpai pangsit goreng dan ceker ayam yang empuk serta kaya rasa.', price:24900, img:'https://via.placeholder.com/600x400?text=Mie+Ayam+Ceker'},
      {cat:'MIE AYAM', name:'MIE AYAM + PANGSIT', desc:'Mie Kenyal berpadu dengan ayam berbumbu gurih, disajikan Bersama pangsit rebus yang lembut dan kuah kaldu hangat', price:25900, img:'https://via.placeholder.com/600x400?text=Mie+Ayam+Pangsit'},
      {cat:'MIE AYAM', name:'MIE AYAM KOMPLIT', desc:'Sajian Lengkap berisi mie kenyal, ayam bumbu istimewa, bakso pangsit, ceker dan sayuran segar', price:35900, img:'https://via.placeholder.com/600x400?text=Mie+Ayam+Komplit'},
      {cat:'PAKET HEMAT', name:'MIE AYAM + ES TEH GOKIL', desc:'Mie AYAM dengan taburan ayam kecap gurih, pangsit goreng renyah dan sayuran segar Bersama Es teh Jumbo', price:30900, img:'https://via.placeholder.com/600x400?text=Paket+Es+Teh'},
      {cat:'PAKET HEMAT', name:'MIE YAMIN + ES TEH GOKIL', desc:'Mie Yamin ditemani Es Teh yang legit!', price:30900, img:'https://via.placeholder.com/600x400?text=Paket+Yamin+Es+Teh'}
    ];

    for(const m of menuItems){
      const catId = categoryIds[m.cat] || null;
      await run(`INSERT OR IGNORE INTO menu_items (category_id,name,description,price,image_url) VALUES (?,?,?,?,?);`, [catId,m.name,m.desc,m.price,m.img]);
    }

    console.log('Database initialized and seeded.');
    console.log('Default admin:', adminEmail,'password:', adminPassword);
    db.close();
  }catch(err){
    console.error(err);
    db.close();
  }
}

init();
