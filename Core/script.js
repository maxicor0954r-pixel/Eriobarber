// Refined Script for ERIO BARBER
import { initNavbar } from './navbar.js'; 
import { initAnimations } from './animations.js'; 
import { initGallery } from './gallery.js'; 
import { initFaq } from './faq.js'; 
import { initBooking } from './booking.js'; 
import { initScrollNavigation } from './scroll-navigation.js'; 

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initAnimations();
    initGallery();
    initFaq();
    initBooking();
    initScrollNavigation();

    // Asegurar reproducción del video Hero
    const heroVideo = document.querySelector(".hero-image video");
    if (heroVideo) {
        // Intentar reproducir explícitamente
        heroVideo.play().catch(() => {
            console.log("El navegador requiere interacción del usuario para reproducir o el archivo no existe.");
        });
    }
});

window.addEventListener("load", () => {
    // No hay lógica específica de navMenu aquí, ya se maneja en initNavbar
});