// c:\Users\User\Downloads\eriobarber\modules\navbar.js

export function initNavbar() {
    const navMenu = document.querySelector(".nav-menu");
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".navbar");

    // Navbar Scroll Effect
    window.addEventListener("scroll", () => {
        if (!nav) return;
        if (window.scrollY > 30) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    });

    // Mobile Menu Toggle
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const icon = menuToggle.querySelector("i");
            if (icon) {
                icon.classList.toggle("bx-menu-alt-right");
                icon.classList.toggle("bx-x");
            }
        });
    }

    // Close menu on link click
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            if (navMenu && navMenu.classList.contains("active")) {
                menuToggle.click(); // Simula un click en el toggle para cerrar
            }
        });
    });
}