
let productContainerHomePage=document.querySelector(".product-card-container")


let productsJson=fetch("prodcuts.json")
  .then(response => response.json())



  productsJson.then(data => {
    for (let i = 0; i < 3; i++) {  
      productContainerHomePage.innerHTML += `
        <div class="product-card col-12 col-sm-6 col-md-4 col-lg-3">
          <div class="card-body position-relative overflow-hidden border rounded ">
            <img src="${data[i].image}" class="img-fluid" alt="${data[i].name}">
            
            <div class="d-flex justify-content-between card-info-header z-2 px-3 position-absolute">
              <div class="card-info-hover">
                <p class="fw-bold">New</p>
                <p class="green">-50 %</p>
              </div>
              <i class="fa-regular fa-heart"></i>
            </div>
          
            <button class="bg-black text-center text-white p-2 border-0 z-2 position-absolute rounded-3">
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
              <p class="fw-semibold mb-0">${data[i].name}</p>
              <p class="card-price d-flex gap-3">
                $ ${data[i].price}
              </p>
            </div>
          </div>
        </div>
      `;
    }
  })
  .catch(error => console.error("Error:", error));

