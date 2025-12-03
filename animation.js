const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if(entry.isIntersecting){
            console.log(entry);
            entry.target.classList.add("animare")
        } else {
            entry.target.classList.remove("animare");
            /* ??? */
        }
    })
})


const hiddenElements = document.querySelectorAll(".why-us");
hiddenElements.forEach((el) => observer.observe(el));