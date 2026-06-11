// modules/utils.js

export function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

export function showFeedback(message, type) {
    const feedbackElement = document.getElementById("booking-feedback");
    if (!feedbackElement) return;
    
    feedbackElement.innerText = message;
    feedbackElement.className = `form-feedback ${type}`;
    feedbackElement.style.display = "block"; // Asegurarse de que sea visible

    // Ocultar el feedback después de 5 segundos
    setTimeout(() => {
        feedbackElement.style.display = "none";
    }, 5000);
}