let listProductHTML = document.querySelector(".listProduct");
      let iconCartSpan = document.querySelector(".icon-cart span");
      let selectModala = document.querySelector(".modala-select");
      const xProd = document.querySelector(".xProduse");
      const pag = document.querySelector(".paginatie")



      let pagNum = 0;

      

      function openFilter() {
        if ((selectModala.style.display = "none")) {
          selectModala.style.display = "flex";
        }
      }

      function closeFilter() {
        if (selectModala.style.display != "none") {
          selectModala.style.display = "none";
        }
      }

      /*
      cart = localStorage.getItem("cart");
      products = [];
      listaProduse1 = [];
      let subTotal = 0;

      console.log(cart);
      totalQuantity = JSON.parse(localStorage.getItem("totalQuantity"));
      console.log(totalQuantity);

      iconCartSpan.innerHTML = totalQuantity;
      */
      cart = localStorage.getItem("cart");
      cart = [];
      let subTotal = 0;
      let start = 0;
      let crop = 16;

      console.log(cart);
      totalQuantity = JSON.parse(localStorage.getItem("totalQuantity"));
      console.log(totalQuantity);

      iconCartSpan.innerHTML = totalQuantity;

      let productCat = new URLSearchParams(window.location.search).get(
          "categorie"
        );

      function filtruDinamic(x){
          window.location.href = `category.html?categorie=${productCat}&sortare=${x}`;
      }

      start = 0;
      crop = 20;

      function changeStart(x){
        start = x * 20;
        crop = start + 20;
        console.log(start, crop);
        addCategorieTata();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      

      function addCategorieTata(x) {
        let t = x;
       

        let productSort = new URLSearchParams(window.location.search).get(
          "sortare"
        );

       console.log(productSort)


        
        let categoriee = parseInt(productCat);
        let sortaree = parseInt(productSort);
        console.log(sortaree);

        let productList = products.filter((d) => d.gender === categoriee);

        productList.forEach((product) => {
          if (product.reducere != undefined || product.reducere > 0) {
            let pretActual =
              product.price - (product.price * product.reducere) / 100;

            Object.assign(product, { pretActual: pretActual });
            
          } else if (product.reducere === undefined || product.reducere == 0) {
            let pretActual = product.price;
            Object.assign(product, { pretActual: pretActual });
           
          }
        });
              
              switch (sortaree) {
          case 0:
            produse = productList;
            break;
          case 1:
            produse = productList.sort((a, b) => a.pretActual - b.pretActual);
            break;
          case 2:
           
            produse = productList.sort((a, b) => b.pretActual - a.pretActual);
           
          default:
            produse = productList;
            break;
        }
        
        addProduse(produse)
      
        catNum = produse.length;
        xProd.innerHTML=`${catNum} produse`;
        pagNum = Math.ceil(catNum / 20) - 1;
        function generatePaginationButtons(pagNum) {
          const paginationContainer = document.querySelector('.pagination');
          if (!paginationContainer) {
              console.error("Pagination container not found!");
              return;
          }
          
          paginationContainer.innerHTML = ''; // Clear previous buttons
  
          for (let i = 0; i <= pagNum; i++) {
          
              const button = document.createElement('button');
              button.textContent = i+1;
              button.classList.add('pagination-button');
              button.setAttribute('onclick', `changeStart(${i})`);
              paginationContainer.appendChild(button);
          }
      }
      generatePaginationButtons(pagNum);
       
      }

      function addProduse(productList) {
        listProductHTML.innerHTML="";
       productList = productList.slice(start, crop);
       
        if (productList.length > 0) {
          productList.forEach((product) => {
            let newProduct = document.createElement("div");
            newProduct.dataset.id = product.id;
            newProduct.classList.add("item");
            newProduct.classList.add(`${product.gender}`);

            if (product.reducere != undefined && product.reducere > 0) {
              let pretActual =
                product.price - (product.price * product.reducere) / 100;
            
              newProduct.innerHTML = `
            <span class="r-bubble">${product.reducere}%</span>
            <a href = "/detail.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <p class="truncate"> ${product.name}</p>
                </a>
                
                <div class="preturi">
                <span class="taiata">${product.price}</span>
                <span class="price">${pretActual} ron</span>
                </div>
                
                
                <button class="addCart"  id=${product.id}>Adauga</button>`;

              listProductHTML.appendChild(newProduct);
            } else if (
              product.reducere === undefined ||
              product.reducere == 0
            ) {
              let pretActual = product.price;
              newProduct.innerHTML = `

            <a href = "/detail.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <p class="truncate"> ${product.name}</p>
                </a>

                <div class="preturi">
                <span class="price">${pretActual} ron</span>
                </div>
                
                
                <button class="addCart"  id=${product.id}>Adauga</button>`;

              listProductHTML.appendChild(newProduct);
            }
          });
        }
      }

      listProductHTML.addEventListener("click", (event) => {
        let positionClick = event.target;
        if (positionClick.classList.contains("addCart")) {
          let product_id = positionClick.parentElement.dataset.id;

          addToCart(product_id);
          totalQuantity = totalQuantity + 1;
          iconCartSpan.innerHTML = totalQuantity;
          localStorage.setItem("totalQuantity", totalQuantity);
        }
      });

      const addToCart = (product_id) => {
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

      try {
        const initApp = () => {
          // get data product

          fetch("products.json")
            .then((response) => response.json())
            .then((data) => {
              products = data;
              addCategorieTata();

              // get data cart from memory
              if (localStorage.getItem("cart")) {
                cart = JSON.parse(localStorage.getItem("cart"));
              }
            });
        };
        initApp();
      } catch (err) {
        console.log("Eroare fetch date");
      }