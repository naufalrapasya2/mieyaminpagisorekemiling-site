/* Simple cart handling for customer pages */
const Cart = (function(){
  const STORAGE_KEY = 'mieyamin_cart_v1';

  function get(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch(e){ return []; }
  }
  function save(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

  function add(item){
    const items = get();
    const found = items.find(i=>i.id==item.id);
    if(found){ found.qty = +found.qty + +item.qty; }
    else items.push(item);
    save(items);
    renderCount();
  }
  function remove(id){ let items=get(); items = items.filter(i=>i.id!=id); save(items); renderCount(); }
  function clear(){ save([]); renderCount(); }

  function renderCount(){
    const badge = document.getElementById('cart-count');
    if(!badge) return;
    const items = get();
    const count = items.reduce((s,i)=>s + (+i.qty),0);
    badge.textContent = count;
  }

  function showCartModal(){
    const items = get();
    const modal = document.getElementById('cart-modal');
    const body = document.getElementById('cart-body');
    if(!modal || !body) return;
    if(items.length===0){ body.innerHTML = '<p>Keranjang kosong</p>'; } else {
      let html = '<table class="table"><tr><th>Menu</th><th>Qty</th><th>Harga</th><th>Subtotal</th><th></th></tr>';
      let subtotal = 0;
      items.forEach(it=>{
        const sub = it.qty * it.price;
        subtotal += sub;
        html += `<tr><td>${it.name}</td><td>${it.qty}</td><td>Rp.${Number(it.price).toLocaleString('id-ID')}</td><td>Rp.${sub.toLocaleString('id-ID')}</td><td><button onclick="Cart.remove(${it.id})">Hapus</button></td></tr>`
      });
      html += `</table><p>Subtotal: <strong>Rp.${subtotal.toLocaleString('id-ID')}</strong></p>`;
      html += `<form id="checkout-form" method="post" action="/checkout">
        <input type="hidden" name="items_json" value='${JSON.stringify(items)}'>
        <label>Nama<br><input name="customer_name" required></label>
        <label>Telepon<br><input name="customer_phone" required></label>
        <label>Alamat<br><input name="customer_address" required></label>
        <label>Ongkir (Rp)<br><input name="shipping" value="0"></label>
        <label>Biaya Layanan (Rp)<br><input name="service_fee" value="0"></label>
        <label>Metode Pembayaran<br>
          <select name="payment_method">
            <option>COD ShopeeFood</option>
            <option>Saldo ShopeeFood</option>
            <option>Kartu Kredit/Debit</option>
          </select>
        </label>
        <button type="submit">Checkout</button>
      </form>`;
      body.innerHTML = html;
    }
    modal.style.display = 'block';
  }

  function hideCartModal(){ const modal = document.getElementById('cart-modal'); if(modal) modal.style.display='none'; }

  return { add, remove, clear, get, renderCount, showCartModal, hideCartModal };
})();

window.addEventListener('DOMContentLoaded',()=>{ Cart.renderCount(); window.Cart = Cart; document.getElementById('cart-open-btn')?.addEventListener('click', Cart.showCartModal); document.getElementById('cart-close-btn')?.addEventListener('click', Cart.hideCartModal); });
