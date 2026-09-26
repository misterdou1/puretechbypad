// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loader);

    try {
        await loadProducts();
        updateCart();
        document.body.classList.add('body-loaded');
        setTimeout(() => loader.remove(), 500);
    } catch (error) {
        console.error("Erreur initialisation:", error);
        document.body.classList.add('body-loaded');
        setTimeout(() => loader.remove(), 500);
    }

    window.addEventListener('scroll', function() {
        const scrollBtn = document.getElementById("scrollTop");
        if (scrollBtn) {
            scrollBtn.style.display = window.scrollY > 300 ? "flex" : "none";
        }
    });
});

// Navigation Mobile
function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('show');
}

// Affichage Produits
function displayProducts(data) {
    const list = document.getElementById('product-list');
    if (!list) return;

    if (!data || data.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Aucun produit trouvé.</p>';
        return;
    }

    list.innerHTML = data.map(p => `
        <div class="product-card" onclick="openModal(${p.id})">
            <img src="${p.img}" loading="lazy" onerror="this.src='https://via.placeholder.com/200'">
            <h3>${p.name}</h3>
            <p class="price">${p.price.toLocaleString()} FCFA</p>
            <button class="btn-add" onclick="event.stopPropagation(); addToCart(${p.id})">Ajouter au panier</button>
        </div>
    `).join('');
}

// --- GESTION DE LA MODALE ---
function openModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const modal = document.getElementById('product-modal');
    document.getElementById('modal-img').src = product.img;
    document.getElementById('modal-name').innerText = product.name;
    document.getElementById('modal-category').innerText = product.category;
    document.getElementById('modal-price').innerText = product.price.toLocaleString() + ' FCFA';

    document.getElementById('modal-desc').innerText = `Découvrez le ${product.name}, un appareil haute performance conçu pour répondre à tous vos besoins technologiques. Qualité premium et garantie assurée par Pure Tech by PAD.`;

    const addBtn = document.getElementById('modal-add-btn');
    addBtn.onclick = () => {
        addToCart(product.id);
        closeModal();
    };

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target == modal) {
        closeModal();
    }
}

// --- RECHERCHE, FILTRES & TRI ---
function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    displayProducts(filtered);
}

function filterProducts(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    displayProducts(filtered);
}

function sortProducts(sortType) {
    let sortedProducts = [...products];

    if (sortType === 'low-high') {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sortType === 'high-low') {
        sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortType === 'name') {
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    displayProducts(sortedProducts);
}

async function loadProducts() {
    console.log("Tentative de chargement depuis le serveur cloud...");
    try {
        const response = await fetch(`http://localhost:5000/api/products?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Réponse serveur non OK');

        const serverProducts = await response.json();
        console.log("Produits chargés depuis le serveur");
        products = serverProducts;
    } catch (error) {
        console.warn("Serveur absent, utilisation de la liste statique (products.js)");
        if (typeof products === 'undefined' || products.length === 0) {
            console.error("ERREUR CRITIQUE : Aucune donnée produit trouvée !");
        }
    }
    displayProducts(products);
}

// --- GESTION DU PANIER AMÉLIORÉE ---
let cart = JSON.parse(localStorage.getItem('pureTechCart')) || [];

function addToCart(id) {
    // IMPORTANT: On s'assure de chercher l'ID dans le tableau 'products'
    const product = products.find(p => p.id === id);
    if (!product) {
        console.error("Produit non trouvé pour l'ID:", id);
        return;
    }

    const existingProduct = cart.find(item => item.id === id);
    if (existingProduct) {
        existingProduct.qty = (existingProduct.qty || 1) + 1;
    } else {
        // On crée une copie propre du produit pour éviter toute référence croisée
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            category: product.category,
            qty: 1
        });
    }

    localStorage.setItem('pureTechCart', JSON.stringify(cart));
    updateCart();
    showToast(`✨ ${product.name} ajouté au panier !`);
}

function updateCart() {
    const count = document.getElementById('cart-count');
    const items = document.getElementById('cart-items');
    const totalDisp = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (count) count.innerText = totalItems;

    if (items) {
        items.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${item.price.toLocaleString()} FCFA</span>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                    <span class="qty-val">${item.qty || 1}</span>
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    if (totalDisp) totalDisp.innerText = total.toLocaleString();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        removeFromCart(index);
    } else {
        localStorage.setItem('pureTechCart', JSON.stringify(cart));
        updateCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('pureTechCart', JSON.stringify(cart));
    updateCart();
    showToast("🗑️ Article supprimé");
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function checkout() {
    if (cart.length === 0) return alert("Panier vide");
    let msg = "Bonjour Pure Tech by PAD, commande :\n";
    cart.forEach(i => msg += `- ${i.name} x${i.qty || 1} (${(i.price * (i.qty || 1)).toLocaleString()} F)\n`);
    const total = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    msg += `\nTotal: ${total.toLocaleString()} FCFA`;
    window.open(`https://wa.me/221781237568?text=${encodeURIComponent(msg)}`, '_blank');
}

function appelerPAD() {
    window.location.href = "tel:+221781237568";
}

function envoyerEmail() {
    window.location.href = "mailto:contact@puretechpad.com?subject=Demande d'information";
}

function ouvrirInstagram() {
    window.open("https://www.instagram.com/puretechbypad", "_blank");
}
