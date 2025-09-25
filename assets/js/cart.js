
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.products = [];
        this.init();
    }

    init() {
        this.loadProducts();
        this.renderCart();
        this.updateCartCount();
        this.bindEvents();
    }

    
    async loadProducts() {
        try {
            const response = await fetch('../prodcuts.json');
            this.products = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = [];
        }
    }


    loadCart() {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }


    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found for id:', productId);
            return;
        }
        this.addProduct(product, quantity);
    }

    addProduct(product, quantity = 1) {
        if (!product) return;

        const key = `${product.id}|${product.name}|${product.image}`;

        const existingItem = this.cart.find(item => item.key === key);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                key,
                id: product.id,
                name: product.name,
                price: Number(product.price) || 0,
                image: product.image,
                category: product.category,
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification('Product added to cart!');
    }

    removeFromCart(identifier) {
        if (typeof identifier === 'string') {
            this.cart = this.cart.filter(item => item.key !== identifier);
        } else {
            this.cart = this.cart.filter(item => item.id !== identifier);
        }
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
    }


    updateQuantity(identifier, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(identifier);
            return;
        }

        const item = typeof identifier === 'string'
            ? this.cart.find(item => item.key === identifier)
            : this.cart.find(item => item.id === identifier);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.renderCart();
            this.updateCartCount();
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }


    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = this.getCartCount();
        }
    }

    renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCartMessage = document.getElementById('empty-cart');
        
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            if (emptyCartMessage) {
                emptyCartMessage.style.display = 'block';
            }
            this.updateSummary();
            return;
        }

        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'none';
        }

        cartItemsContainer.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
        this.updateSummary();
    }


    createCartItemHTML(item) {
        return `
            <div class="card mb-3 cart-item" data-id="${item.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-3 col-md-2">
                            <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
                        </div>
                        <div class="col-6 col-md-4">
                            <h6 class="card-title mb-1">${item.name}</h6>
                            <p class="text-muted mb-0">${item.category}</p>
                        </div>
                        <div class="col-3 col-md-2 text-center">
                            <div class="input-group input-group-sm">
                                <button class="btn btn-outline-secondary" type="button" onclick="cartManager.updateQuantity('${item.key}', ${item.quantity - 1})">-</button>
                                <input type="number" class="form-control text-center" value="${item.quantity}" min="1" 
                                       onchange="cartManager.updateQuantity('${item.key}', parseInt(this.value))">
                                <button class="btn btn-outline-secondary" type="button" onclick="cartManager.updateQuantity('${item.key}', ${item.quantity + 1})">+</button>
                            </div>
                        </div>
                        <div class="col-6 col-md-2 text-center">
                            <span class="fw-bold">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div class="col-6 col-md-2 text-end">
                            <button class="btn btn-outline-danger btn-sm" onclick="cartManager.removeFromCart('${item.key}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

 
    updateSummary() {
        const subtotal = this.getCartTotal();
        const shipping = subtotal > 200 ? 0 : 10; // Free shipping over $200
        const total = subtotal + shipping;

        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
        }
    }

    showNotification(message) {

        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <i class="fa-solid fa-check-circle me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    bindEvents() {

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (btn) {
                e.preventDefault();
                // Require login before adding to cart
                if (!this.isLoggedIn()) {
                    this.showNotification('Please login to add items to cart');
                    const isInAssets = window.location.pathname.toLowerCase().includes('/assets/');
                    const loginPath = isInAssets ? 'Login.html' : 'assets/Login.html';
                    setTimeout(() => { window.location.href = loginPath; }, 600);
                    return;
                }
                const indexAttr = btn.dataset.productIndex;
                if (indexAttr != null && indexAttr !== '') {
                    const productIndex = parseInt(indexAttr);
                    const product = this.products[productIndex];
                    if (product) {
                        this.addProduct(product, 1);
                        return;
                    }
                }
                // Fallback: build product object from data-* attributes
                const name = btn.dataset.productName;
                const price = Number(btn.dataset.productPrice);
                const image = btn.dataset.productImage;
                const category = btn.dataset.productCategory;
                const id = parseInt(btn.dataset.productId);
                if (name && !Number.isNaN(price)) {
                    this.addProduct({ id, name, price, image, category }, 1);
                    return;
                }
                // Last fallback: by id only
                const productId = parseInt(btn.dataset.productId);
                if (!Number.isNaN(productId)) {
                    this.addToCart(productId);
                }
            }
        });
    }

    // Simple auth check using localStorage
    isLoggedIn() {
        try {
            const raw = localStorage.getItem('currentUser');
            if (!raw) return false;
            const user = JSON.parse(raw);
            return Boolean(user && user.id && user.email);
        } catch {
            return false;
        }
    }


    clearCart() {
        this.cart = [];
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
    }
}


let cartManager;

document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();
});


window.addToCart = function(productId) {
    if (cartManager) {
        cartManager.addToCart(productId);
    }
};

window.removeFromCart = function(productId) {
    if (cartManager) {
        cartManager.removeFromCart(productId);
    }
};

window.updateQuantity = function(productId, quantity) {
    if (cartManager) {
        cartManager.updateQuantity(productId, quantity);
    }
};
