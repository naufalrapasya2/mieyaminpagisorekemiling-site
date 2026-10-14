# MIE YAMIN PAGI SORE KEMILING - final production deployment guide

This update adds:
- Branch 'release/production' content merged into main for production packaging.

This document summarizes how to deploy and verify the application in production.

1) Prerequisites
- Ubuntu VPS or hosting with Node.js 18+
- Domain record: mieyaminpagisorekemiling.id -> server IP
- Nginx installed
- Certbot for HTTPS
- PM2 installed
- Midtrans credentials (if enabling payment gateway)

2) Install system dependencies
sudo apt update
sudo apt install -y curl build-essential nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pm2

3) Clone and switch to release branch
cd /var/www
sudo git clone git@github.com:naufalrapasya2/mieyaminpagisorekemiling-site.git
cd mieyaminpagisorekemiling-site
git checkout release/production

4) Configure environment
cp .env.production.example .env
nano .env

Fill in values:
- SESSION_SECRET: strong random string
- MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY: valid keys
- MIDTRANS_PRODUCTION: 0 for sandbox, 1 for live
- SMTP if email reset password is desired

5) Install dependencies and initialize database
npm install --production
npm run init-db

6) Start app via PM2
pm2 start app.js --name mieyamin-site --env production
pm2 save
pm2 status

7) Nginx reverse proxy
Create /etc/nginx/sites-available/mieyamin:

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
        alias /var/www/mieyaminpagisorekemiling-site/public/uploads/;
    }
}

Then:

sudo ln -s /etc/nginx/sites-available/mieyamin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

8) SSL via Certbot
sudo certbot --nginx -d mieyaminpagisorekemiling.id -d www.mieyaminpagisorekemiling.id

9) Verify launch
- Open https://mieyaminpagisorekemiling.id
- Login admin at /admin/login
- Test checkout flow
- Test payment flow if Midtrans keys are valid
- Test PDF receipt endpoint /receipt/:id/pdf
- Test upload product image in admin panel

10) Production notes
- .env must stay on the server and not be committed to GitHub.
- Use PM2 logs and set proper permissions for upload folders.
- Use production Midtrans keys only after sandbox testing succeeds.
- If you do not have SMTP yet, the forgot-password feature continues to work via manual reset in the admin screen.

11) Recommended next step after deployment
- Replace placeholder product images with original pictures of each menu item.
- Add final business metadata in SEO tags and social previews.
- Re-test all flows in production before launching public campaigns.
