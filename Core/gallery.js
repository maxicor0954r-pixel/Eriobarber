// c:\Users\User\Downloads\eriobarber\modules\gallery.js

export function initGallery() {
    const imagenesGaleria = document.querySelectorAll(".gallery-grid img");
    if (imagenesGaleria.length > 0) {
        const lightbox = document.createElement("div");
        lightbox.classList.add("lightbox");
        const imgGrande = document.createElement("img");
        imgGrande.classList.add("lightbox-content");
        const cerrar = document.createElement("span");
        cerrar.classList.add("close-lightbox");
        cerrar.innerHTML = "&times;";
        lightbox.appendChild(cerrar);
        lightbox.appendChild(imgGrande);
        document.body.appendChild(lightbox);

        imagenesGaleria.forEach((imagen) => {
            imagen.addEventListener("click", () => {
                imgGrande.src = imagen.src;
                lightbox.style.display = "flex"; 
                document.body.style.overflow = "hidden";
            });
        });

        cerrar.addEventListener("click", () => {
            lightbox.style.display = "none";
            document.body.style.overflow = "auto";
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }
}