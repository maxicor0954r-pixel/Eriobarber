export function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    if (galleryItems.length === 0) return;

    let lightbox = document.querySelector('.lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <span class="close-lightbox">&times;</span>
            <img class="lightbox-content" src="" alt="Vista ampliada">
        `;
        document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('.lightbox-content');
    const closeBtn = lightbox.querySelector('.close-lightbox');

    galleryItems.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.style.display = 'flex';
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) {
            lightbox.style.display = 'none';
        }
    });
}