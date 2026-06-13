// c:\Users\User\Downloads\eriobarber\assets\js\modules\booking.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getTodayString, timeToMinutes, showFeedback } from './utils.js';

const firebaseConfig = {
  apiKey: "AIzaSyCL4gjVqC5U7ozJubOUH0sPiMOw0ByTro",
  authDomain: "barberia-a2feb.firebaseapp.com",
  databaseURL: "https://barberia-a2feb-default-rtdb.firebaseio.com",
  projectId: "barberia-a2feb",
  storageBucket: "barberia-a2feb.firebasestorage.app",
  messagingSenderId: "925004420024",
  appId: "1:925004420024:web:b1080ad083ff3f81fe354d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bookingsCol = collection(db, "bookings");

const bookingForm = document.getElementById("booking-form");
const bookingDateInput = document.getElementById("booking-date");
const bookingTimeSelect = document.getElementById("booking-time");
const bookingPhoneInput = document.getElementById("booking-phone");

function setTodayAsDefaultDate() {
    if (!bookingDateInput) return;
    const today = getTodayString();
    bookingDateInput.value = today;
    bookingDateInput.min = today;
}

async function updateAvailableTimes() {
    if (!bookingTimeSelect || !bookingDateInput) return;
    
    const selectedDate = bookingDateInput.value;
    if (!selectedDate) return;

    const dateObj = new Date(selectedDate + "T00:00:00");
    const isSunday = dateObj.getDay() === 0;
    const todayStr = getTodayString();
    
    const slots = isSunday 
        ? ["13:00", "14:00", "15:00", "16:00", "17:00"]
        : ["10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30", "19:30", "20:30"];

    bookingTimeSelect.innerHTML = '<option value="">Selecciona una hora</option>';

    const q = query(bookingsCol, where("date", "==", selectedDate));
    const querySnapshot = await getDocs(q);
    const bookedHours = [];
    querySnapshot.forEach((doc) => {
        bookedHours.push(doc.data().time);
    });

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    slots.forEach(time => {
        if (selectedDate === todayStr) {
            if (timeToMinutes(time) <= currentMinutes) return;
        }
        if (bookedHours.includes(time)) {
            return;
        }
        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        bookingTimeSelect.appendChild(option);
    });
}

export function initBooking() {
    // Inicializar EmailJS con la clave pública proporcionada
    emailjs.init({
        publicKey: "W81HytrOQRHZQ1ehG",
    });

    setTodayAsDefaultDate();
    updateAvailableTimes();

    if (bookingPhoneInput) {
        bookingPhoneInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
            bookingPhoneInput.value = value;
        });
    }

    if (bookingDateInput) {
        bookingDateInput.addEventListener("change", updateAvailableTimes);
    }

    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const bookingData = {
                name: document.getElementById("booking-name").value,
                phone: document.getElementById("booking-phone").value,
                service: document.getElementById("booking-service").value,
                barber: document.getElementById("booking-barber").value,
                date: bookingDateInput.value,
                time: bookingTimeSelect.value,
            };

            if (!bookingData.name || !bookingData.phone || !bookingData.service || !bookingData.time) {
                showFeedback("Por favor, completa todos los campos obligatorios.", "error");
                return;
            }

            const phoneRegex = /^[0-9]{9}$/;
            if (!phoneRegex.test(bookingData.phone)) {
                showFeedback("Ingresa un teléfono válido de 9 dígitos.", "error");
                return;
            }

            if (bookingData.date < getTodayString()) {
                showFeedback("Selecciona una fecha válida.", "error");
                return;
            }

            const q = query(bookingsCol, where("date", "==", bookingData.date), where("time", "==", bookingData.time));
            const checkSnapshot = await getDocs(q);
            
            if (!checkSnapshot.empty) {
                showFeedback("Esta hora ya no está disponible.", "error");
                updateAvailableTimes();
                return;
            }

            try {
                await addDoc(bookingsCol, {
                    ...bookingData,
                    createdAt: serverTimestamp()
                });

                // Enviar notificación por correo usando EmailJS
                await emailjs.send("service_uayc5qk", "template_44bj455", {
                    name: bookingData.name,
                    phone: bookingData.phone,
                    service: bookingData.service,
                    barber: bookingData.barber,
                    date: bookingData.date,
                    time: bookingData.time,
                    email: "no-reply@eriobarber.cl",
                    title: "Nueva reserva en Erio Barber"
                });

                showFeedback("¡Reserva solicitada con éxito!", "success");
            } catch (error) {
                console.error("Error Firebase:", error);
                showFeedback("Error al procesar la reserva.", "error");
                return;
            }

            bookingForm.reset();
            setTodayAsDefaultDate();
            updateAvailableTimes();
        });
    }
}