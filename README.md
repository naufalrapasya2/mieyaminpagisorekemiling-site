# Mie Yamin Pagi Sore Kemiling - Node.js + SQLite scaffold

Repository: https://github.com/naufalrapasya2/mieyaminpagisorekemiling-site

Quickstart:

1. Clone repo
   git clone https://github.com/naufalrapasya2/mieyaminpagisorekemiling-site
2. Install
   cd mieyaminpagisorekemiling-site
   npm install
3. Copy env
   cp .env.example .env
   Edit .env if needed
4. Initialize database and seed data
   npm run init-db
   (This creates data/database.sqlite and a default admin user: admin@mieyamin.local / Admin123!)
5. Start server
   npm start
6. Open http://localhost:3000

Admin:
- Login: http://localhost:3000/admin/login
- Default admin: admin@mieyamin.local / Admin123!

Notes:
- Passwords are hashed using bcryptjs.
- Forgot password page allows resetting password by providing the admin email and a new password (SMTP not configured).
- Midtrans payment integration placeholders exist; fill MIDTRANS_* keys in .env and implement server-side calls in routes when ready.
- To deploy to your domain mieyaminpagisorekemiling.id, upload to your server or VPS, set NODE_ENV=production, install Node.js, and configure reverse proxy (NGINX) + SSL.

What's next I'll do if you want:
- Implement Midtrans checkout flow and sample integration.
- Add PDF receipt generation and printing.
- Add more UI polish and full menu seed (if you want every item added).
