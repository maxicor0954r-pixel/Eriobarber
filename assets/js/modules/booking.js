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
const bookingDateDisplay = document.getElementById("booking-date-display");
const bookingTimeSelect = document.getElementById("booking-time");
const bookingPhoneInput = document.getElementById("booking-phone");
const calendarGrid = document.getElementById("calendar-grid");
const currentMonthText = document.getElementById("current-month-text");

let selectedDate = getTodayString();
let viewDate = new Date(); // Para navegar meses

function renderCalendar() {
    if (!calendarGrid) return;
    calendarGrid.innerHTML = "";
    
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Nombres meses en español
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    currentMonthText.textContent = `${monthNames[month]} ${year}`;

    // Ajuste para que lunes sea primer día (0=Dom -> 6=Sab)
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    // Días semana labels
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    labels.forEach(l => {
        const el = document.createElement("div");
        el.className = "day-label";
        el.textContent = l;
        calendarGrid.appendChild(el);
    });

    // Espacios vacíos
    for (let i = 0; i < offset; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        calendarGrid.appendChild(empty);
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";
        dayEl.textContent = d;

        if (date < today) {
            dayEl.classList.add("disabled");
        } else {
            if (dateStr === selectedDate) dayEl.classList.add("selected");
            dayEl.onclick = () => {
                selectedDate = dateStr;
                bookingDateDisplay.textContent = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                renderCalendar();
                updateAvailableTimes();
            };
        }
        calendarGrid.appendChild(dayEl);
    }
}


async function updateAvailableTimes() {
    if (!bookingTimeSelect) return;

    const dateObj = new Date(selectedDate + "T12:00:00");
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

    renderCalendar();
    updateAvailableTimes();

    // Navegación calendario
    document.getElementById("prev-month")?.addEventListener("click", () => {
        viewDate.setMonth(viewDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById("next-month")?.addEventListener("click", () => {
        viewDate.setMonth(viewDate.getMonth() + 1);
        renderCalendar();
    });

    if (bookingPhoneInput) {
        bookingPhoneInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
            bookingPhoneInput.value = value;
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const bookingData = {
                name: document.getElementById("booking-name").value,
                phone: document.getElementById("booking-phone").value,
                service: document.getElementById("booking-service").value,
                barber: document.getElementById("booking-barber").value,
                date: selectedDate,
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
            selectedDate = getTodayString();
            viewDate = new Date();
            renderCalendar();
            updateAvailableTimes();
        });
    }
}