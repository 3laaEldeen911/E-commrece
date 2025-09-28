var cart = [];  
var products = [];

document.addEventListener("DOMContentLoaded", function () {
  cart = loadCart();
  loadProducts();
  renderCart();
  updateCartCount();

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".add-to-cart-btn");
    if (btn) {
      e.preventDefault();
      if (!isLoggedIn()) {
        showNote("Please sign up to add items to cart");
        var isInAssets =
          window.location.pathname.toLowerCase().indexOf("/assets/") !== -1;
        var signupPath = isInAssets ? "SignUp.html" : "assets/SignUp.html";
        setTimeout(function () {
          window.location.href = signupPath;
        }, 600);
        return;
      }
      var idxAttr = btn.dataset.productIndex;
      if (idxAttr !== undefined && idxAttr !== "") {
        var p = products[parseInt(idxAttr)];
        if (p) {
          addProduct(p, 1);
          return;
        }
      }
      var name = btn.dataset.productName;
      var price = Number(btn.dataset.productPrice);
      var image = btn.dataset.productImage;
      var category = btn.dataset.productCategory;
      var id = parseInt(btn.dataset.productId);
      if (name && !isNaN(price)) {
        addProduct(
          {
            id: id,
            name: name,
            price: price,
            image: image,
            category: category,
          },
          1
        );
        return;
      }
      if (!isNaN(id)) addToCart(id, 1);
    }
  });
});

function loadProducts() {
  var paths = ["../prodcuts.json", "prodcuts.json", "assets/prodcuts.json"];
  (function tryNext(i) {
    if (i >= paths.length) {
      products = [];
      return;
    }
    fetch(paths[i])
      .then(function (r) {
        if (!r.ok) throw 0;
        return r.json();
      })
      .then(function (list) {
        products = list || [];
      })
      .catch(function () {
        tryNext(i + 1);
      });
  })(0);
}

function loadCart() {
  var raw = localStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function isLoggedIn() {
  var raw = localStorage.getItem("currentUser");
  if (!raw) return false;
  try {
    var u = JSON.parse(raw);
    return !!(u && u.id && u.email);
  } catch {
    return false;
  }
}

function addToCart(productId, quantity) {
  var p = products.find(function (x) {
    return x.id === productId;
  });
  if (!p) return;
  addProduct(p, quantity || 1);
}

function addProduct(p, qty) { 
  if (!p) return;
  var key = String(p.id) + "|" + (p.name || "") + "|" + (p.image || "");
  var item = cart.find(function (x) {
    return x.key === key;
  });
  if (item) {
    item.quantity += qty || 1;
  } else {
    cart.push({
      key: key,
      id: p.id,
      name: p.name, 
      price: Number(p.price) || 0,
      image: p.image,
      category: p.category,
      quantity: qty || 1,
    });
  }
  saveCart();
  updateCartCount();
  showNote("Product added to cart!");
}

function removeFromCart(identifier) {
  if (typeof identifier === "string") {
    cart = cart.filter(function (i) {
      return i.key !== identifier;
    });
  } else {
    cart = cart.filter(function (i) {
      return i.id !== identifier;
    });
  }
  saveCart();
  renderCart();
  updateCartCount();
}

function updateQuantity(identifier, qty) {
  if (qty <= 0) {
    removeFromCart(identifier);
    return;
  }
  var item =
    typeof identifier === "string"
      ? cart.find(function (i) {
          return i.key === identifier;
        })
      : cart.find(function (i) {
          return i.id === identifier;
        });
  if (item) {
    item.quantity = qty;
    saveCart();
    renderCart();
    updateCartCount();
  }
}

function getCartCount() {
  return cart.reduce(function (n, i) {
    return n + i.quantity;
  }, 0);
}

function getCartTotal() {
  return cart.reduce(function (sum, i) {
    return sum + i.price * i.quantity;
  }, 0);
}

function updateCartCount() {
  var el = document.getElementById("cart-count");
  if (el) {
    el.textContent = getCartCount();
  }
}

function renderCart() {
  var container = document.getElementById("cart-items");
  var empty = document.getElementById("empty-cart");
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = "";
    if (empty) empty.style.display = "block";
    updateSummary();
    return;
  }
  if (empty) empty.style.display = "none";
  container.innerHTML = cart.map(createCartItemHTML).join("");
  updateSummary();
}

function createCartItemHTML(item) {
  return `
    <div class="card mb-3 cart-item" data-id="${item.id}">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-3 col-md-2">
            <img src="${item.image || ""}" alt="${item.name || ""}" class="img-fluid rounded">
          </div>
          <div class="col-6 col-md-4">
            <h6 class="card-title mb-1">${item.name || ""}</h6>
            <p class="text-muted mb-0">${item.category || ""}</p>
          </div>
          <div class="col-3 col-md-2 text-center">
            <div class="input-group input-group-sm">
              <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${item.key}', ${item.quantity - 1})">-</button>
              <input type="number" class="form-control text-center" value="${item.quantity}" min="1" onchange="updateQuantity('${item.key}', parseInt(this.value))">
              <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${item.key}', ${item.quantity + 1})">+</button>
            </div>
          </div>
          <div class="col-6 col-md-2 text-center">
            <span class="fw-bold">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <div class="col-6 col-md-2 text-end">
            <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${item.key}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateSummary() {
  var subtotal = getCartTotal();
  var shipping = subtotal > 200 ? 0 : 10;
  var total = subtotal + shipping;
  var s = document.getElementById("subtotal");
  var sh = document.getElementById("shipping");
  var t = document.getElementById("total");
  var btn = document.getElementById("checkout-btn");
  if (s) s.textContent = "$" + subtotal.toFixed(2);
  if (sh) sh.textContent = "$" + shipping.toFixed(2);
  if (t) t.textContent = "$" + total.toFixed(2);
  if (btn) btn.disabled = cart.length === 0;
}

function showNote(msg) {
  var note = document.createElement("div");
  note.className = "alert alert-success position-fixed";
  note.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  note.textContent = msg;
  document.body.appendChild(note);
  setTimeout(function () {
    note.remove();
  }, 2000);
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
