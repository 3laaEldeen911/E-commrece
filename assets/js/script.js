let slideImage = Array.from(document.querySelectorAll(".slider-container img"))
console.log(slideImage);

let sliderCount = slideImage.length
let currentSlide =1

let nextSlide =document.querySelector(".next")
let prevSlide =document.querySelector(".prev")
console.log(sliderCount)
function slideCheck(){

}
removeActiveSlider()

function removeActiveSlider() {
    slideImage.forEach(img=>{
        // img.classList.remove("active")
    })
}

// /////////////////////////////////////////////////////////////////
// Products rendering on Home Page
// NOTE: We avoid top-level await; wrap logic in DOMContentLoaded

document.addEventListener("DOMContentLoaded", () => {
    const productContainerHomePage = document.querySelector(".product-card-container");
    if (!productContainerHomePage) {
        console.warn(".product-card-container not found in DOM");
        return;
    }

    loadAndRenderProducts(productContainerHomePage).catch((error) => {
        console.error("Failed to load products:", error);
    });
});

async function loadAndRenderProducts(containerElement) {
    // Try to fetch products JSON. Adjust the path if your file is elsewhere.
    // Resolved relative to the page URL (index.html), not this script file.
    const possibleUrls = [
        "prodcuts.json", // common misspelling as in your codebase
        "assets/prodcuts.json",
        "assets/products.json",
        "products.json"
    ];

    let data = null;
    let lastError = null;

    for (const url of possibleUrls) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            data = await response.json();
            break;
        } catch (err) {
            lastError = err;
            // Try next URL
        }
    }

    if (!data) {
        throw lastError || new Error("Products JSON not found");
    }

    // Support either an object with a products array or a plain array
    const products = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);

    const firstFour = products.slice(0, 4);

    // Build cards markup with product index for stable unique keying in cart
    const cardsHtml = firstFour.map((p, idx) => buildProductCardHtml(p, idx)).join("");

    // If you already have static cards, you can replace or append.
    // Here we replace existing content to ensure only 4 cards show.
    containerElement.innerHTML = cardsHtml;
}

function buildProductCardHtml(product, index) {
    const {
        id,
        title,
        name,
        productName,
        price,
        oldPrice,
        image,
        img,
        imageUrl,
        rating,
        isNew,
        discountPercent
    } = product || {};

    const displayName = title || name || productName || "Product";
    const displayImage = image || img || imageUrl || "assets/img/frist-card.png";
    const displayPrice = typeof price === "number" ? `$${price.toFixed(2)}` : (price || "$0.00");
    const displayOldPrice = typeof oldPrice === "number" ? `$${oldPrice.toFixed(2)}` : (oldPrice || "");
    const displayDiscount = typeof discountPercent === "number" ? `-${discountPercent} %` : (discountPercent || "");
    const isNewBadge = Boolean(isNew);

    // Build stars (default 5)
    const starsCount = Math.max(0, Math.min(5, Number(rating) || 5));
    const starsHtml = new Array(5).fill(0).map((_, idx) => {
        return `<i class="fa-solid fa-star${idx < starsCount ? "" : ""}"></i>`;
    }).join("");

    return `
  <div class="product-card col-12 col-sm-6 col-md-4 col-lg-3">
    <div class="card-body position-relative overflow-hidden border rounded ">
      <img src="${displayImage}" class="img-fluid" alt="${escapeHtml(displayName)}">
      <div class="d-flex justify-content-between card-info-header z-2 px-3 position-absolute">
        <div class="card-info-hover">
          ${isNewBadge ? `<p class="fw-bold">New</p>` : ""}
          ${displayDiscount ? `<p class="green">${escapeHtml(displayDiscount)}</p>` : ""}
        </div>
        <i class="fa-regular fa-heart"></i>
      </div>
      <button class="bg-black text-center text-white p-2 border-0 z-2 position-absolute rounded-3 add-to-cart-btn" data-product-id="${id}" data-product-index="${index}">
        Add to cart
      </button>
    </div>
    <div class="card-footer p-2">
      <div class="card-rate">
        ${starsHtml}
      </div>
      <div class="card-name">
        <p class="fw-semibold mb-0">${escapeHtml(displayName)}</p>
        <p class="card-price d-flex gap-3">
          ${escapeHtml(displayPrice)} ${displayOldPrice ? `<del>${escapeHtml(displayOldPrice)}</del>` : ""}
        </p>
      </div>
    </div>
  </div>`
}

function escapeHtml(text) {
    if (text == null) return "";
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
