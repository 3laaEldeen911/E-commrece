let productContainer = document.querySelector(".product-container")
let allProducts = []

fetch("../prodcuts.json")
  .then(response=>response.json())
  .then(products=>{
    // Preserve original index to keep Add to Cart mapping stable after filtering
    allProducts = products.map((p, i) => ({ ...p, __idx: i }))
    renderProducts(allProducts)
  })

function renderProducts(list){
    productContainer.innerHTML = ""
    list.forEach((card, index) => {
        productContainer.innerHTML +=`
        <div class="product-card col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card-body position-relative overflow-hidden border rounded ">
        <img src="${card.image}" class="img-fluid" alt="card">
        
        <div class="d-flex justify-content-between card-info-header z-2 px-3 position-absolute">
            <div class="card-info-hover">
            <p class="fw-bold">New</p>
            <p class="green">-50 %</p>
            </div>
            <i class="fa-regular fa-heart"></i>
        </div>

        <button class="bg-black text-center text-white p-2 border-0 z-2 position-absolute rounded-3 add-to-cart-btn"
            data-product-id="${card.id}"
            data-product-index="${card.__idx ?? index}"
            data-product-name="${card.name}"
            data-product-price="${Number(card.price)}"
            data-product-image="${card.image}"
            data-product-category="${card.category}">
            Add to cart
        </button>
        </div>

        <div class="card-footer p-2">
        <div class="card-rate">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
        </div>
        <div class="card-name">
            <p class="fw-semibold mb-0">${card.name}</p>
            <p class="card-price d-flex gap-3">
            $${Number(card.price).toFixed(2)}
            </p>
        </div>
        </div>
    </div>
        `
        
    });
}


document.addEventListener("change", function(e){
    if(!e.target.closest(".price-filter")) return

    const all = document.getElementById("priceAll")
    const r1 = document.getElementById("price1") 
    const r2 = document.getElementById("price2") 
    const r3 = document.getElementById("price3") 
    const r4 = document.getElementById("price4")
    const r5 = document.getElementById("price5")


    if(e.target === all){
        if(all.checked){
            r1.checked = r2.checked = r3.checked = r4.checked = r5.checked = false
        }
    } else {

        all.checked = false
    }

    const activeRanges = []
    if(r1.checked) activeRanges.push([0, 99.99])
    if(r2.checked) activeRanges.push([100, 199.99])
    if(r3.checked) activeRanges.push([200, 299.99])
    if(r4.checked) activeRanges.push([300, 399.99])
    if(r5.checked) activeRanges.push([400, Infinity])

    let filtered = all.checked || activeRanges.length === 0
        ? allProducts
        : allProducts.filter(p => {
            const price = Number(p.price) || 0
            return activeRanges.some(([min,max]) => price >= min && price <= max)
        })

    renderProducts(filtered)
})