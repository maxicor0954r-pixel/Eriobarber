// c:\Users\User\Downloads\eriobarber\modules\scroll-navigation.js

export function initScrollNavigation() {
    // Navigation Active Link on Scroll
    const sections = document.querySelectorAll("section[id]");
    window.addEventListener("scroll", () => {
        let current = "";
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150; // Offset para que el link se active antes de llegar al top de la sección
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute("id");
            }
        });

        document.querySelectorAll(".nav-links a").forEach(link => {
            link.classList.remove("active");
            // Asegurarse de que el href del link coincida con el ID de la sección actual
            if (link.getAttribute("href").includes(current) && current !== "") {
                link.classList.add("active");
            }
        });
    });
}