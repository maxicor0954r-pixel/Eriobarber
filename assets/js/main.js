// Refined Script for ERIO BARBER - Entry Point
import { initNavbar } from './modules/navbar.js';
import { initAnimations } from './modules/animations.js';
import { initGallery } from './modules/gallery.js';
import { initFaq } from './modules/faq.js';
import { initBooking } from './modules/booking.js';
import { initScrollNavigation } from './modules/scroll-navigation.js';

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
        heroVideo.play().catch(() => {
            console.log("El navegador requiere interacción del usuario para reproducir.");
        });
    }
});

window.addEventListener("load", () => {
    // Lógica adicional post-carga si es necesaria
});