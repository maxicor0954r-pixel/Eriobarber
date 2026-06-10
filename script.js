// Refined Script for ERIO BARBER
window.addEventListener("scroll", () => {
    const nav = document.querySelector(".navbar");
    if (!nav) return;
    if (window.scrollY > 30) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});

// Mobile Menu Toggle
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");

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

// Cerrar menú al hacer click en un link
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        if (navMenu) {
            navMenu.classList.remove("active");
            const icon = menuToggle.querySelector("i");
            if (icon) {
                icon.classList.add("bx-menu-alt-right");
                icon.classList.remove("bx-x");
            }
        }
    });
});

// Animación de Contadores (Stats)
const stats = document.querySelectorAll(".stat-number");
const animateStats = () => {
    stats.forEach(stat => {
        const target = +stat.getAttribute("data-target");
        const isDecimal = stat.getAttribute("data-decimal") === "true";
        let count = 0;
        const increment = target / 50;

        const updateCount = () => {
            if (count < target) {
                count += increment;
                stat.innerText = isDecimal ? count.toFixed(1) : Math.ceil(count);
                setTimeout(updateCount, 20);
            } else {
                stat.innerText = isDecimal ? target.toFixed(1) : target;
            }
        };
        updateCount();
    });
};

// Observador para iniciar contadores
const statsSection = document.querySelector(".stats-section");
if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateStats();
            observer.unobserve(statsSection);
        }
    }, { threshold: 0.5 });
    observer.observe(statsSection);
}

// Animación Scroll Reveal
const elementos = document.querySelectorAll(".scroll-reveal");
if (elementos.length > 0) {
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.15 });
    elementos.forEach((el) => {
        scrollObserver.observe(el);
    });
}

// Lightbox Gallery System
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

// FAQ Accordion Logic
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active')); // Cierra otros
        if (!isOpen) item.classList.add('active');
    });
});

// Navigation Active Link on Scroll
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
    let current = "";
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute("id");
        }
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href").includes(current) && current !== "") {
            link.classList.add("active");
        }
    });
});

// Asegurar reproducción del video Hero
document.addEventListener("DOMContentLoaded", () => {
    const heroVideo = document.querySelector(".hero-image video");
    if (heroVideo) {
        // Intentar reproducir explícitamente
        heroVideo.play().catch(() => {
            console.log("El navegador requiere interacción del usuario para reproducir o el archivo no existe.");
        });
    }

    // Asegurar que el menú móvil esté cerrado al cargar el DOM
    if (navMenu) navMenu.classList.remove("active");
});

window.addEventListener("load", () => {
    if (navMenu) navMenu.classList.remove("active");
});