# Mie Yamin Pagi Sore Kemiling - Node.js + SQLite scaffold (Finalization)

This update adds:
- Midtrans payment integration (server-side) placeholder: if MIDTRANS_SERVER_KEY is set in .env, the app creates a Snap transaction and redirects customer to Midtrans payment page.
- PDF receipt generation using PDFKit (/receipt/:id/pdf)
- Admin order management page (/admin/orders) with status update
- Product images updated to Unsplash sample URLs (you can replace with your real images)
- Admin can set image_url when adding menu items

.env variables to set for payments:
- MIDTRANS_SERVER_KEY - your Midtrans server key
- MIDTRANS_PRODUCTION - set to '1' for production environment

If MIDTRANS keys are not set, the checkout will still create orders and render receipt but won't redirect to a live payment gateway.

Quick run (same as before):
1. npm install (will install midtrans-client and pdfkit)
2. npm run init-db
3. npm start

Notes:
- Replace sample Unsplash image URLs in db/init.js if you have real product photos.
- To fully enable card payments, provide MIDTRANS_SERVER_KEY and set MIDTRANS_PRODUCTION accordingly.
- For production deployment, secure your .env and use HTTPS for the domain.
