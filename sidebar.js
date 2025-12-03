function showModala() {
    const modala = document.querySelector(".side-nav");
    const backk = document.querySelector(".tot");
    modala.classList.add("seVede");
    backk.classList.add("blurata");
    if (modala.classList.contains("seVede")) {
      let blurr = document.querySelector(".blurata");
      blurr.addEventListener("click", () => {
        modala.classList.remove("seVede");
        backk.classList.remove("blurata");
      });
    }
  }