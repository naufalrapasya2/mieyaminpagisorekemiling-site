## Deploy-ready packaging & Midtrans activation guide

This section explains how to finalize templating with real product photos, activate Midtrans payments, and deploy the app to the domain mieyaminpagisorekemiling.id.

1) Add real product photos
- Two options:
  - Upload images via Admin -> Kelola Menu by using the "Upload Gambar Produk" field. Uploaded files are saved to public/uploads and served automatically.
  - Or host images elsewhere and paste their full URL into the "URL Gambar" field when adding/editing a menu item.
- After uploading, open the home page to verify images appear on product cards.

2) Activate Midtrans payments (Card/Debit)
- Sign up to Midtrans and get Server Key (for server-side API) and Client Key (for frontend if you decide to use Snap Web).
- Add these to your .env file:
  MIDTRANS_SERVER_KEY=your_server_key_here
  MIDTRANS_PRODUCTION=0  # or 1 for production
- The app uses midtrans-client on server-side to create Snap transactions when customer selects "Kartu Kredit/Debit" during checkout. If MIDTRANS_SERVER_KEY is missing, the order is still created but payment redirection will not occur.
- To test, set MIDTRANS_PRODUCTION=0 and use your Midtrans sandbox Server Key.

3) Generate PDF struk
- On receipt page, users can download PDF via /receipt/:id/pdf
- Admin can also print receipt from admin orders list.

4) Deploy to server and configure domain
Prerequisites: a VPS (Ubuntu) or hosting with Node.js support. We'll outline steps for a typical Ubuntu VPS.

a) Install Node.js, NPM and build tools
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs build-essential

b) Clone repo and install
  git clone https://github.com/naufalrapasya2/mieyaminpagisorekemiling-site.git
  cd mieyaminpagisorekemiling-site
  npm install
  cp .env.example .env
  # edit .env: set PORT=3000, SESSION_SECRET, MIDTRANS_SERVER_KEY, etc.
  npm run init-db

c) Run with PM2 (recommended)
  sudo npm i -g pm2
  pm2 start app.js --name mieyamin-site
  pm2 save
  pm2 startup systemd

d) Setup Nginx as reverse proxy with SSL (Certbot)
  sudo apt install nginx
  # sample server block (replace with your domain)
  
  server {
    listen 80;
    server_name mieyaminpagisorekemiling.id www.mieyaminpagisorekemiling.id;

    location / {
      proxy_pass http://127.0.0.1:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
      alias /path/to/repo/public/uploads/;
    }
  }

  # enable and restart nginx
  sudo ln -s /etc/nginx/sites-available/mieyamin /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx

  # obtain SSL
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d mieyaminpagisorekemiling.id -d www.mieyaminpagisorekemiling.id

5) DNS
- Point your domain mieyaminpagisorekemiling.id to the server IP with an A record.

6) Post-deploy checks
- Visit https://mieyaminpagisorekemiling.id
- Test uploads via admin and order flow
- If using Midtrans, run a test transaction (sandbox keys) and verify redirect/payment

If you want, saya bisa:
- Tambahkan fungsi upload bulk foto (zip + unzip to uploads)
- Membuat script deploy.sh untuk otomatisasi PM2 + Nginx setup (requires sudo)
- Bantu lakukan deploy ke VPS (anda berikan akses) atau pandu langkah-langkah secara remote
