let listProductHTML = document.querySelector(".container-1");
        let iconCartSpan = document.querySelector(".icon-cart span");
        let similare = document.querySelector(".shower");
        let subTotal = 0;
        
        let cart = JSON.parse(localStorage.getItem("cart"));
          if (!cart) {
            cart = []; // Initialize as an empty array if cart is null
          }
                

          let totalQuantity = JSON.parse(localStorage.getItem("totalQuantity"));
            if (!totalQuantity) {
              totalQuantity = 0; // Initialize totalQuantity as 0 if it's null
            }

      iconCartSpan.innerHTML = totalQuantity;


        let productId = new URLSearchParams(window.location.search).get("id");

        console.log(typeof productId);

        let products = null;
        fetch("products.json")
          .then((response) => response.json())
          .then((data) => {
            products = data;
            showDetail();
            Indexare();
          });

        let x = 0;

        function careimg(t) {
          x = t;
          console.log(t);
        }

        // gasire produs
        function showDetail() {
          let content = document.querySelector(".content");
          let price = document.querySelector(".price");

          let thisProduct = products.filter((value) => {
            return value.id == productId;
          })[0];

          let reducere = thisProduct.reducere;
          console.log(typeof reducere);

          let initial = document.querySelector(".pretInitial");

          let idProdus = productId;
          console.log(idProdus);
          let product_id = parseInt(productId);
          console.log(typeof product_id, product_id);
          // daca nu e bine nr de product id ii da return la homepage
          console.log(x);
          let genProdus = "";
          let vizualizari = getRandomInt(19, 2);


          if ((thisProduct.gender == 1)) {
            genProdus = "Parfumuri Femei";
          } else if ((thisProduct.gender == 2)) {
            genProdus = "Parfumuri Barbati";
          } else if ((thisProduct.gender == 3)){
            genProdus = "Parfumuri Unisex"
          }


          if (!thisProduct) {
            window.location.href = "/";
          } else {
            let productGallery = document.createElement("div");
            let contentSide = document.createElement("div");

            productGallery.classList.add("productGallery");
            contentSide.classList.add("contentS");
            contentSide.dataset.id = thisProduct.id;

            productGallery.innerHTML = `
            
            <img src="${thisProduct.image}" id="img-show" alt="${thisProduct.name}">
     
           
            `;
            content.appendChild(productGallery);

            if (reducere == 0 || reducere === undefined) {
              let pretActual = thisProduct.price;
              console.log(pretActual);
              contentSide.innerHTML = `
            <div class="top-info">
            <div class="cat-brand-name">
              <a href="category.html?categorie=${thisProduct.gender}">${genProdus}       /</a>
            <h2>${thisProduct.name}</h2>
            <span>(${thisProduct.rating}<svg class="star-svg" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/2000/xlink" width="21px" height="20px" viewBox="0 0 21 20">
            <path d="M15.422,18.129l-5.264-2.768l-5.265,2.768l1.006-5.863L1.64,8.114l5.887-0.855l2.632-5.334l2.633,5.334l5.885,0.855l-4.258,4.152L15.422,18.129z"/>
            </svg>)  <span>Inca ${vizualizari.toFixed( 0)} persoane vizualizeaza acest produs!</span> </span>
            </div>
             <div class="PretAdd">
            <h3>Pret:   ${thisProduct.price} ron</h3>
            <button onclick="addToCart(${thisProduct.id})">Adauga</button>
            </div>

            <p>${thisProduct.descriere}</p>

            <p class="note"> Note de Varf: ${thisProduct.varf}</p>
            <p class="note"> Note de Inima: ${thisProduct.mijloc} </p>
            <p class="note"> Note de Baza: ${thisProduct.baza} </p>
            </div>
            
            `;
            } else {
              let pretActual =
                thisProduct.price - (thisProduct.price * reducere) / 100;
              console.log(pretActual);
              contentSide.innerHTML = `
              <div class="top-info">
            <div class="cat-brand-name">
              <a href="category.html?categorie=${thisProduct.gender}">${genProdus}       /</a>
            <h2>${thisProduct.name}</h2>
            <span>(${thisProduct.rating}<svg class="star-svg" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/2000/xlink" width="21px" height="20px" viewBox="0 0 21 20">
            <path d="M15.422,18.129l-5.264-2.768l-5.265,2.768l1.006-5.863L1.64,8.114l5.887-0.855l2.632-5.334l2.633,5.334l5.885,0.855l-4.258,4.152L15.422,18.129z"/>
            </svg>)  <span>Inca ${vizualizari.toFixed( 0)} persoane vizualizeaza acest produs!</span> </span>
            </div>
            
            <div class="PretAdd">
            <h3>Pret:  <span class="taiata">${
              thisProduct.price
            }</span>    ${pretActual} ron</h3>
            
            <button onclick="addToCart(${thisProduct.id})">Adauga</button>
          </div>



            
            <p>${thisProduct.descriere}</p>

            <p class="note"> Note de Varf: ${thisProduct.varf}</p>
            <p class="note"> Note de Inima: ${thisProduct.mijloc} </p>
            <p class="note"> Note de Baza: ${thisProduct.baza} </p>
            
            `;
            }
            content.appendChild(contentSide);
          }
        }

        function getRandomInt(max, min) {
          return Math.random() * (max - min) + min;
        }

        function Indexare() {
          
          let currentIndex = parseInt(productId);
          console.log(currentIndex);


          let listaProduseCat = [];
          let plusIndex = currentIndex + 12;
          let minusIndex = currentIndex - 12;
          console.log(plusIndex);

          if (plusIndex > products.length){
            listaProduseCat = products.slice(minusIndex, currentIndex - 1);
          } else{
            listaProduseCat = products.slice(currentIndex, plusIndex);
          }

          console.log(listaProduseCat);

          listaProduseCat.forEach((product) => {
            let newProduct = document.createElement("div");
            newProduct.setAttribute("id", product.id);

            newProduct.classList.add("item-crsl");
            if (product.reducere != undefined && product.reducere > 1) {
              let pretActual =
                product.price - (product.price * product.reducere) / 100;

              newProduct.innerHTML = `
            
             <span class="r-bubble">${product.reducere}%</span>
            <a href = "/detail.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h2 class="truncate">${product.name}</h2>
                </a>

               <div class="preturi">
                <span class="taiata">${product.price}</span>
                <span class="price">${pretActual} ron</span>
                </div>
               
                <button class="addCart"  id=${product.id}>Adauga</button>
                `;
              } else {
              newProduct.innerHTML = `
              <a href = "/detail.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h2 class="truncate">${product.name}</h2>
                </a>
                <div class="preturi">
                <span class="price">${product.price} ron</span>
                </div>
                <button class="addCart"  id=${product.id}>Adauga</button>
                `;

             
            }

              similare.appendChild(newProduct);
            
          });
        }


      
      


        similare.addEventListener("click", (event) => {
          let positionClick = event.target;
          if (positionClick.classList.contains("addCart")) {
            let product_id = positionClick.parentElement.id;
            
            console.log(product_id);
            addToCart(product_id);
           
          }
        });

        const addToCart = (product_id) => {
          totalQuantity = totalQuantity + 1;
            iconCartSpan.innerHTML = totalQuantity;
            localStorage.setItem("totalQuantity", totalQuantity);
        let positionThisProductInCart = cart.findIndex(
          (value) => value.product_id == product_id
        );
        if (cart.length <= 0) {
          cart = [
            {
              product_id: product_id,
              quantity: 1,
            },
          ];
        } else if (positionThisProductInCart < 0) {
          cart.push({
            product_id: product_id,
            quantity: 1,
          });
        } else {
          cart[positionThisProductInCart].quantity =
            cart[positionThisProductInCart].quantity + 1;
        }

        addCartToMemory();
      };

      const addCartToMemory = () => {
        localStorage.setItem("cart", JSON.stringify(cart));
      };
      
        document.querySelector(".next").onclick = function () {
          const widthItem = document.querySelector(".item-crsl").offsetWidth;
          console.log(typeof widthItem);
          document.querySelector(".shower").scrollLeft -= widthItem * 3;
        };
        document.querySelector(".prev").onclick = function () {
          const widthItem = document.querySelector(".item-crsl").offsetWidth;
          console.log(typeof widthItem);
          document.querySelector(".shower").scrollLeft += widthItem * 3;
        };