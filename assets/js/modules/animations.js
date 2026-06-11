// c:\Users\User\Downloads\eriobarber\modules\animations.js

export function initAnimations() {
    // Animación de Contadores (Stats)
    const stats = document.querySelectorAll(".stat-number");
    const statsSection = document.querySelector(".stats-section");

    if (stats.length && statsSection) {
        let hasAnimated = false;

        const animateStats = () => {
            if (hasAnimated) return;
            hasAnimated = true;

            stats.forEach(stat => {
                // Soporte para números con puntos (ej: 1.500)
                const target = parseFloat(stat.getAttribute("data-target")?.toString().replace(/\./g, '')) || 0;
                const isDecimal = stat.getAttribute("data-decimal") === "true";
                let count = 0;
                const increment = target / 60;

                const updateCount = () => {
                    count += increment;
                    if (count < target) {
                        stat.innerText = isDecimal ? count.toFixed(1) : Math.ceil(count);
                        requestAnimationFrame(updateCount);
                    } else {
                        stat.innerText = isDecimal ? target.toFixed(1) : target;
                    }
                };
                updateCount();
            });
        };

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    animateStats();
                    observer.disconnect();
                }
            }, { threshold: 0.1 }); // Menor umbral para asegurar que dispare pronto
            observer.observe(statsSection);
        } else {
            animateStats();
        }

        setTimeout(() => {
            if (!hasAnimated) animateStats();
        }, 800);
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
}