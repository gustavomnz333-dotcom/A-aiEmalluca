// ========= script.js =========

// ----- Config -----
let cart = [];
const whatsappNumber = "5511951247812"; // <-- coloque seu número aqui (ex: 5511999999999)

// set footer year
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// util: format BR
function formatBR(num){
  // calcular dígito por dígito implicitly via toFixed then replace
  return 'R$ ' + Number(num).toFixed(2).replace('.',',');
}

// ---------- PRODUCT: passos e adicionar ----------
document.querySelectorAll('.product-card').forEach(card => {
  const steps = Array.from(card.querySelectorAll('.product-step'));
  const indicator = card.querySelector('.current-step');
  let current = 0;
  if(steps[current]) steps[current].classList.add('step-active');

  // next-step buttons
  card.querySelectorAll('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      // validate if radio options present in current step
      const radios = steps[current].querySelectorAll('input[type="radio"]');
      if(radios.length > 0){
        let ok = false;
        radios.forEach(r => { if(r.checked) ok = true; });
        if(!ok){ alert('Selecione uma opção antes de continuar.'); return; }
      }

      steps[current].classList.remove('step-active');
      current++;
      if(current >= steps.length) current = steps.length - 1;
      steps[current].classList.add('step-active');
      if(indicator) indicator.textContent = (current + 1);
    });
  });

  // add to cart buttons
  card.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      // get chosen size (name ends with "tamanho")
      const sizeEl = card.querySelector('input[name$="tamanho"]:checked');
      if(!sizeEl){
        alert('Escolha um tamanho antes de adicionar.');
        return;
      }
      const cremeEl = card.querySelector('input[name$="creme"]:checked');
      const massaEl = card.querySelector('input[name$="massa"]:checked');
      const complements = Array.from(card.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);

      const item = {
        productName: card.dataset.name,
        name: card.dataset.name + ' ' + sizeEl.value,
        size: sizeEl.value,
        creme: cremeEl ? cremeEl.value : null,
        massa: massaEl ? massaEl.value : null,
        complementos: complements,
        price: parseFloat(sizeEl.dataset.price),
        qty: 1
      };

      cart.push(item);
      alert('Adicionado ao carrinho!');
      // reset product UI
      steps.forEach(s => s.classList.remove('step-active'));
      current = 0;
      if(steps[current]) steps[current].classList.add('step-active');
      if(indicator) indicator.textContent = (current + 1);
      card.querySelectorAll('input').forEach(i => i.checked = false);
      updateCartUI();
    });
  });
});

// ---------- CART UI (render, remove, qty) ----------
function updateCartUI(){
  const cartItemsEl = document.getElementById('cartItems');
  const cartCountEls = [
    document.getElementById('cart-count'),
    document.getElementById('cart-count-2'),
    document.getElementById('cart-count-footer')
  ];
  const cartTotalEl = document.getElementById('cartTotal');
  const mobileTotalEl = document.getElementById('mobileTotal');

  if(!cartItemsEl) return;
  cartItemsEl.innerHTML = '';

  let total = 0;
  cart.forEach((it, idx) => {
    total += it.price * it.qty;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';

    const comps = (it.complementos && it.complementos.length) ? it.complementos.join(', ') : '-';
    itemDiv.innerHTML = `
      <div class="left">
        <strong>${it.name}</strong>
        <small>Creme: ${it.creme || '-'}</small>
        <small>Massa: ${it.massa || '-'}</small>
        <small>Complementos: ${comps}</small>

        <div class="item-controls">
          <button class="qty-btn" data-action="minus" data-idx="${idx}">−</button>
          <div style="min-width:28px;text-align:center">${it.qty}</div>
          <button class="qty-btn" data-action="plus" data-idx="${idx}">+</button>
          <button class="remove-btn" data-idx="${idx}">Remover</button>
        </div>
      </div>
      <div class="right">
        <div>${formatBR(it.price * it.qty)}</div>
      </div>
    `;

    cartItemsEl.appendChild(itemDiv);
  });

  // update counts
  const count = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEls.forEach(el => { if(el) el.textContent = count; });

  // update totals
  if(cartTotalEl) cartTotalEl.textContent = formatBR(total);
  if(mobileTotalEl) mobileTotalEl.textContent = formatBR(total);

  // attach listeners for qty and remove
  cartItemsEl.querySelectorAll('.qty-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      const idx = Number(b.dataset.idx);
      const action = b.dataset.action;
      if(action === 'plus') cart[idx].qty += 1;
      else cart[idx].qty = Math.max(1, cart[idx].qty - 1);
      updateCartUI();
    });
  });
  cartItemsEl.querySelectorAll('.remove-btn').forEach(b => {
    b.addEventListener('click', () => {
      const idx = Number(b.dataset.idx);
      if(confirm('Remover este item?')){
        cart.splice(idx, 1);
        updateCartUI();
      }
    });
  });

  // update mobile cart button totals
  const cartCountFooter = document.getElementById('cart-count-footer');
  if(cartCountFooter) cartCountFooter.textContent = count;
}

// ---------- CART modal open/close & shortcuts ----------
const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartMobileBtn');
const openCartFooter = document.getElementById('openCartFooter');
const closeCartBtn = document.getElementById('closeCart');
const quickCheckout = document.getElementById('quickCheckout');
const cartMobileBtnMain = document.getElementById('cartMobileBtn');

if(cartBtn){
  cartBtn.addEventListener('click', () => cartModal.setAttribute('aria-hidden','false'));
}
if(closeCartBtn){
  closeCartBtn.addEventListener('click', () => cartModal.setAttribute('aria-hidden','true'));
}
if(openCartFooter){
  openCartFooter.addEventListener('click', () => cartModal.setAttribute('aria-hidden','false'));
}
if(cartMobileBtnMain){
  cartMobileBtnMain.addEventListener('click', () => cartModal.setAttribute('aria-hidden','false'));
}
if(quickCheckout){
  quickCheckout.addEventListener('click', () => {
    cartModal.setAttribute('aria-hidden','false');
    // focus address maybe
    const addr = document.getElementById('deliveryAddress');
    if(addr) addr.focus();
  });
}

// CLEAR CART
const clearCartBtn = document.getElementById('clearCart');
if(clearCartBtn){
  clearCartBtn.addEventListener('click', () => {
    if(confirm('Deseja limpar o carrinho?')){
      cart = [];
      updateCartUI();
    }
  });
}

// ---------- Delivery radio logic ----------
const deliveryRadios = document.querySelectorAll('input[name="deliveryType"]');
const addressBlock = document.getElementById('addressBlock');
const addressInput = document.getElementById('deliveryAddress');

deliveryRadios.forEach(r => {
  r.addEventListener('change', () => {
    if(r.value === 'Entrega' && r.checked){
      addressBlock.style.display = 'block';
      if(addressInput) addressInput.focus();
    } else if(r.value === 'Retirada' && r.checked){
      addressBlock.style.display = 'none';
    }
  });
});

// ---------- Categories (filter) ----------
document.querySelectorAll('.cat').forEach(li => {
  li.addEventListener('click', () => {
    document.querySelectorAll('.cat').forEach(x => x.classList.remove('active'));
    li.classList.add('active');
    const filter = li.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      if(filter === 'all') card.style.display = '';
      else card.style.display = (card.dataset.category === filter) ? '' : 'none';
    });
    // hide sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    if(window.innerWidth < 900 && sidebar) sidebar.style.display = 'none';
  });
});

// open/close sidebar for mobile
const openCategories = document.getElementById('openCategories');
if(openCategories){
  openCategories.addEventListener('click', () => {
    const side = document.getElementById('sidebar');
    if(side) side.style.display = (side.style.display === 'block') ? 'none' : 'block';
  });
}

// ---------- Finalize order: WhatsApp message ----------
const finishOrderBtn = document.getElementById('finishOrder');
if(finishOrderBtn){
  finishOrderBtn.addEventListener('click', () => {
    if(cart.length === 0){
      alert('Carrinho vazio. Adicione algum produto antes de finalizar.');
      return;
    }
    const deliveryTypeEl = document.querySelector('input[name="deliveryType"]:checked');
    const deliveryType = deliveryTypeEl ? deliveryTypeEl.value : 'Retirada';
    const address = addressInput ? addressInput.value.trim() : '';

    if(deliveryType === 'Entrega' && (!address || address.length < 5)){
      alert('Por favor preencha o endereço completo para entrega.');
      if(addressInput) addressInput.focus();finishOrderBtn.addEventListener('click', () => {
  if(cart.length === 0){
    alert('Carrinho vazio. Adicione algum produto antes de finalizar.');
    return;
  }
  const deliveryTypeEl = document.querySelector('input[name="deliveryType"]:checked');
  const deliveryType = deliveryTypeEl ? deliveryTypeEl.value : 'Retirada';
  const address = addressInput ? addressInput.value.trim() : '';

  if(deliveryType === 'Entrega' && (!address || address.length < 5)){
    alert('Por favor preencha o endereço completo para entrega.');
    if(addressInput) addressInput.focus();
    return;
  }

  // Monta objeto para salvar no Firestore
  const pedido = {
    itens: cart,
    total: cart.reduce((sum, it) => sum + it.price * it.qty, 0),
    tipoEntrega: deliveryType,
    endereco: address || null,
    criadoEm: new Date()
  };

  // Salva no Firestore
  db.collection('pedidos').add(pedido)
    .then(() => console.log("Pedido salvo com sucesso!"))
    .catch(err => console.error("Erro ao salvar pedido:", err));

  // --- continua com o código do WhatsApp que vocês já têm ---
  let message = `Olá, gostaria de fazer um pedido:%0A%0A`;
  let total = 0;
  cart.forEach((it, idx) => {
    message += `${idx+1}. ${it.productName} - ${it.size}%0A`;
    if(it.creme) message += `   Creme: ${it.creme}%0A`;
    if(it.massa) message += `   Massa: ${it.massa}%0A`;
    if(it.complementos && it.complementos.length) message += `   Complementos: ${it.complementos.join(', ')}%0A`;
    message += `   Quantidade: ${it.qty}%0A`;
    message += `   Valor: R$ ${(it.price * it.qty).toFixed(2).replace('.', ',')}%0A%0A`;
    total += it.price * it.qty;
  });
  message += `Total: R$ ${total.toFixed(2).replace('.', ',')}%0A`;
  message += `Opção: ${deliveryType}%0A`;
  if(deliveryType === 'Entrega') message += `Endereço: ${encodeURIComponent(address)}%0A`;
  message += `%0AObrigado!`;

  const url = `https://wa.me/5511951247812?text=${message}`;
  window.open(url, '_blank');
});

      return;
    }

    // build message
    let message = `Olá, gostaria de fazer um pedido:%0A%0A`; // using URL-encoded newline
    let total = 0;
    cart.forEach((it, idx) => {
      message += `${idx+1}. ${it.productName} - ${it.size}%0A`;
      if(it.creme) message += `   Creme: ${it.creme}%0A`;
      if(it.massa) message += `   Massa: ${it.massa}%0A`;
      if(it.complementos && it.complementos.length) message += `   Complementos: ${it.complementos.join(', ')}%0A`;
      message += `   Quantidade: ${it.qty}%0A`;
      message += `   Valor: ${formatBR(it.price * it.qty)}%0A%0A`;
      total += it.price * it.qty;
    });
    message += `Total: ${formatBR(total)}%0A`;
    message += `Opção: ${deliveryType}%0A`;
    if(deliveryType === 'Entrega') message += `Endereço: ${encodeURIComponent(address)}%0A`;
    message += `%0AObrigado!`;

    const url = `https://wa.me/${+5511951247812}?text=${message}`;
    window.open(url, '_blank');
  });
}

// initialize UI counts
updateCartUI();