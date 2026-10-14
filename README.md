# Mie Yamin Pagi Sore Kemiling - Node.js + SQLite scaffold (Updated UI)

Repository: https://github.com/naufalrapasya2/mieyaminpagisorekemiling-site

What's new in this update:
- Improved UI styles and responsive layout
- Product images support (image_url column)
- Client-side cart (add to cart, modal, checkout)
- Category pages with images and add-to-cart
- Receipt (struk) page formatted with order breakdown
- Ratings page and Location page with Google Maps embed
- Admin menu management supports image URL and shows thumbnails

Quickstart (same as before):

1. Clone repo
   git clone https://github.com/naufalrapasya2/mieyaminpagisorekemiling-site
2. Install
   cd mieyaminpagisorekemiling-site
   npm install
3. Copy env
   cp .env.example .env
4. Initialize database and seed data
   npm run init-db
5. Start server
   npm start
6. Open http://localhost:3000

Notes & next steps:
- Fill MIDTRANS keys in .env to enable card payments (server code to call Midtrans can be added).
- You can upload real product images and use their URLs when adding menu items in admin.
- For production deployment, configure a reverse proxy (NGINX) and SSL for mieyaminpagisorekemiling.id.
