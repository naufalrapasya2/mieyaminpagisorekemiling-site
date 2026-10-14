# MIE YAMIN PAGI SORE KEMILING - local launch guide

This file is for local testing and temporary public sharing.

Quickstart:

1. Clone repo
   git clone git@github.com:naufalrapasya2/mieyaminpagisorekemiling-site.git
   cd mieyaminpagisorekemiling-site
2. Optional: switch to release/production branch
   git checkout release/production
3. Copy environment template if needed
   cp .env.production.example .env
4. Run local deploy script
   chmod +x deploy-local.sh
   ./deploy-local.sh
5. Open local website:
   http://localhost:3000

Public sharing options:
- ngrok
  export NGROK_AUTHTOKEN=your_authtoken
  ./deploy-local.sh
- localtunnel
  npm install -g localtunnel
  ./deploy-local.sh

Default admin credentials:
- Email: admin@mieyamin.local
- Password: Admin123!

Notes:
- This is suitable for local preview and temporary sharing, not production.
- Admin can upload real product images later from the admin panel.
- For a production deployment, use the release/production branch and follow README_DEPLOY.md.
