# Final QA Checklist — MIE YAMIN PAGI SORE KEMILING

Use this checklist to validate the application before marking the release as production-ready. Run these tests in sandbox/preview environment first (NGROK/local) then repeat on production.

1) General site
- [ ] Server runs without errors (pm2 status or npm start) and serves on configured port.
- [ ] Home page loads correctly and displays categories and product cards.
- [ ] Images load (placeholders acceptable if admin hasn't uploaded photos yet).
- [ ] Navigation (Category -> Product pages -> Cart) works.

2) Admin
- [ ] Admin login works with default admin credentials.
- [ ] Lupa password flow updates password when email and new password provided.
- [ ] Admin can add a category (if UI implemented) and menu item.
- [ ] Admin can upload image file for a product and image appears in public/uploads and on product card.
- [ ] Admin can delete a menu item and associated upload is removed from disk.
- [ ] Admin can view orders and change order status; status change persists.

3) Cart & Checkout
- [ ] Add multiple items to cart, update quantities correctly.
- [ ] Checkout form validates required fields (name, phone, address).
- [ ] Order is created in DB and visible in admin orders list.
- [ ] Receipt page displays correct breakdown: subtotal per menu, shipping, service fee, total.
- [ ] PDF receipt downloads and displays correct totals.

4) Payments (Midtrans) — sandbox test
- [ ] .env contains MIDTRANS_SERVER_KEY (sandbox) and MIDTRANS_PRODUCTION=0.
- [ ] Choose Kartu Kredit/Debit in checkout; server creates Snap transaction and returns redirect_url.
- [ ] Redirect to Midtrans sandbox payment page works.
- [ ] Complete sandbox payment flow; verify order confirmation or webhook (if implemented).
- [ ] If webhook implemented: payment notification updates order.status accordingly.

5) ShopeeFood / External order flow
- [ ] "Pesan via ShopeeFood" button redirects to https://spf.shopee.co.id/W7Pki1FGq
- [ ] Links open in new tab and do not interrupt current session.

6) Maps & Store Info
- [ ] Location page shows Google Maps embed and store address.
- [ ] Opening hours and Halal certificate displayed.

7) Security & Stability
- [ ] SESSION_SECRET set and not default in production.
- [ ] .env not committed to repo; secrets stored on server only.
- [ ] File upload accepts only images and reasonable size (test by uploading a non-image file and a large file).
- [ ] Rate-limiting and basic input validation applied where needed.

8) Deployment checks
- [ ] Nginx reverse proxy serves the app and static uploads correctly.
- [ ] SSL works via Certbot (https://mieyaminpagisorekemiling.id loads with valid cert).
- [ ] PM2 restarts the app on server reboot (pm2 startup + pm2 save done).

9) Post-deploy
- [ ] Replace placeholder images with real product photos.
- [ ] Update MIDTRANS_PRODUCTION=1 and replace keys with production keys only after sandbox tests pass.
- [ ] Final smoke test: place an order end-to-end as a customer and verify admin workflow.

Notes & triage:
- Document any failing tests with reproduction steps, logs, and screenshots where possible.
- Prioritize fixing payment flow, image uploads, and order persistence bugs before public launch.
