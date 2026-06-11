// c:\Users\User\Downloads\eriobarber\modules\faq.js

export function initFaq() {
    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            // Cierra otros elementos FAQ activos
            faqItems.forEach(i => i.classList.remove('active')); 
            // Abre el actual si no estaba abierto
            if (!isOpen) item.classList.add('active');
        });
    });
}