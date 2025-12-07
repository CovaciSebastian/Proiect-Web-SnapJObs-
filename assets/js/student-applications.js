let listCartHTML = document.querySelector(".listCart");
        let iconCart = document.querySelector(".icon-cart");
        let iconCartSpan = document.querySelector(".icon-cart span");
        let subtotal = document.querySelector(".subtotal");
        let paginaCart = document.querySelector(".pagina-cart");
        

        cart = JSON.parse(localStorage.getItem("cart"));
        console.log(typeof cart, cart);
        let totalQuantity = JSON.parse(localStorage.getItem("totalQuantity"));
        console.log(totalQuantity);

        let subTotal = 0;
        let transport = 19.99;
        

        const addCartToHTML = () => {
          listCartHTML.innerHTML = "";
          let totalQuantity = 0;
           if (cart.length > 0) {
            cart.forEach((item) => {
              totalQuantity = totalQuantity + item.quantity;

              let newItem = document.createElement("div");
              newItem.classList.add("itemCart");
              newItem.dataset.id = item.product_id;

              let positionProduct = products.findIndex(
                (value) => value.id == item.product_id
              );
              let info = products[positionProduct];
              let pretActual = info.price - (info.price * info.reducere) / 100;

              let z = "";
           
              if (info.gender === 1){
                 z = "Produse femei"
                
              }

              if(info.gender === 2){
                 z = " Produse barbati"
                
              }

              

              let sumaLocala = pretActual * item.quantity;
              item.sumaLocala = sumaLocala;
              item.n = info.name;
              item.p = info.price;

              subTotal = cart.reduce((arr, cart) => arr + cart.sumaLocala, 0);

              /*
               <div class="taiata">$${info.price}</div>
               */

              newItem.innerHTML = `
              <div class="produs">
                
                    <img src="${info.image}" alt="${info.name}">
                
                <div class="name">
                    <a href="detail.html?id=${info.id}">${info.name}</a>

                    <a href="category.html?categorie=${info.gender}" class="genderCart">
                    <p>${z}</p>
                    </a>
                    
                </div>
              </div>
               
                <div class="quantity">
                    <button class="minus">-</button>
                    <span>${item.quantity}</span>
                    <button class="plus">+</button>
                  </div>
                    
            
                  <span class="sumalocala"> ${sumaLocala} </span>
                
            `;
            
            listCartHTML.appendChild(newItem);
            
            });
            
          } else {
            const pagina = document.querySelector(".pagina-cart");
            pagina.innerHTML = "<h3>Cosul dvs. este gol</div> "
          }
          
          iconCartSpan.innerHTML = totalQuantity;
          let totalComanda = subTotal + transport;
          localStorage.setItem("totalQuantity", totalQuantity);
          
          subtotal.innerHTML =` 
          <div class="tabelTotal">   <span>Subtotal:</span>  <span> ${subTotal} ron</span> </div>
          <div class="tabelTotal">   <span>Transport</span>  <span> ${transport} ron</span> </div>
          <hr/>
          <div class="tabelTotal">   <h3>Total:</h3>  <h3> ${totalComanda} ron</h3> </div>
                              `;
          console.log(totalQuantity);
        };

        listCartHTML.addEventListener("click", (event) => {
          let positionClick = event.target;
          if (
            positionClick.classList.contains("minus") ||
            positionClick.classList.contains("plus")
          ) {
            let product_id =
              positionClick.parentElement.parentElement.dataset.id;
            let type = "minus";
        

            if (positionClick.classList.contains("plus")) {
              type = "plus";
             
            }
            changeQuantityCart(product_id, type);
          }
        });
        const changeQuantityCart = (product_id, type) => {
          let positionItemInCart = cart.findIndex(
            (value) => value.product_id == product_id
          );
          if (positionItemInCart >= 0) {
            let info = cart[positionItemInCart];
            switch (type) {
              case "plus":
                cart[positionItemInCart].quantity =
                  cart[positionItemInCart].quantity + 1;
                break;

              default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                  cart[positionItemInCart].quantity = changeQuantity;
                } else {
                  cart.splice(positionItemInCart, 1);
                }
                break;
            }
          }
         
          addCartToHTML();
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

                // get data cart from memory
                if (localStorage.getItem("cart")) {
                  cart = JSON.parse(localStorage.getItem("cart"));
                  addCartToHTML();
                  console.log(cart);
                }
              });
          };
          initApp();
        } catch (err) {
          console.log("Eroare fetch date");
        }