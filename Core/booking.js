// c:\Users\User\Downloads\eriobarber\modules\booking.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getTodayString, timeToMinutes, showFeedback } from './utils.js'; // Ruta relativa actualizada

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
const bookingDateInput = document.getElementById("booking-date"); // Ahora es input type="text" readonly
const bookingTimeSelect = document.getElementById("booking-time"); // Mantener este ID
const bookingPhoneInput = document.getElementById("booking-phone");
const calendarEl = document.getElementById("calendar");

let currentDate = new Date();
let selectedDateObj = null;

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const days = ["L", "M", "M", "J", "V", "S", "D"];

function renderCalendar() {
    if (!calendarEl) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1; // Ajuste para Lunes inicio

    calendarEl.innerHTML = `
        <div class="calendar-header">
            <button type="button" id="prevMonth">‹</button>
            <strong>${months[month]} ${year}</strong>
            <button type="button" id="nextMonth">›</button>
        </div>
        <div class="calendar-grid">
            ${days.map(d => `<div class="day-name">${d}</div>`).join("")}
        </div>
    `;

    const grid = calendarEl.querySelector(".calendar-grid");
    for (let i = 0; i < startDay; i++) grid.innerHTML += `<div></div>`;

    const today = new Date();
    today.setHours(0,0,0,0);

    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d);
        const isDisabled = date < today;
        const isSelected = selectedDateObj && date.toDateString() === selectedDateObj.toDateString();
        
        const dayDiv = document.createElement("div");
        dayDiv.className = `day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`;
        dayDiv.textContent = d;
        
        if (!isDisabled) {
            dayDiv.onclick = () => {
                selectedDateObj = date;
                const day = String(d).padStart(2, '0');
                const monthNum = String(month + 1).padStart(2, '0');
                
                // Lo que ve el usuario
                const displayDate = `${day}/${monthNum}/${year}`;
                // Lo que usa Firebase
                const firebaseDate = `${year}-${monthNum}-${day}`;
                
                bookingDateInput.setAttribute('data-firebase-date', firebaseDate);
                bookingDateInput.value = displayDate;
                
                calendarEl.classList.add("hidden");
                updateAvailableTimes();
                
                // Revertimos el value al formato Firebase justo después de que updateAvailableTimes lo lea 
                // o simplemente nos aseguramos que updateAvailableTimes reciba el formato correcto.
            };
        }
        grid.appendChild(dayDiv);
    }

    document.getElementById("prevMonth").onclick = (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };
    document.getElementById("nextMonth").onclick = (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };
}

function setTodayAsDefaultDate() {
    if (!bookingDateInput) return;
    
    bookingDateInput.addEventListener("click", (e) => {
        e.stopPropagation();
        calendarEl.classList.toggle("hidden");
        renderCalendar();
    });

    document.addEventListener("click", (e) => {
        if (calendarEl && !calendarEl.contains(e.target)) {
            calendarEl.classList.add("hidden");
        }
    });

    const todayFirebaseFormat = getTodayString(); // utils.js devuelve YYYY-MM-DD
    bookingDateInput.setAttribute('data-firebase-date', todayFirebaseFormat);
    
    // Para mostrar al usuario en formato DD-MM-YYYY
    const [y, m, d] = todayFirebaseFormat.split('-');
    bookingDateInput.value = `${d}/${m}/${y}`;
}

async function updateAvailableTimes() {
    if (!bookingTimeSelect || !bookingDateInput) return;
    
    // Obtener la fecha en formato YYYY-MM-DD desde el atributo data-firebase-date
    // Esto asegura que siempre se use el formato correcto para Firebase
    const selectedDate = bookingDateInput.getAttribute('data-firebase-date');

    if (!selectedDate) return;

    // Validar formato para el constructor de Date
    const dateObj = new Date(selectedDate + "T12:00:00");
    const isSunday = dateObj.getDay() === 0;
    const todayStr = getTodayString();
    
    // Horarios base
    const slots = isSunday 
        ? ["13:00", "14:00", "15:00", "16:00", "17:00"]
        : ["10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30", "19:30", "20:30"];

    bookingTimeSelect.innerHTML = '<option value="">Selecciona una hora</option>';

    // Consultar Firestore para buscar reservas de esa fecha
    const q = query(bookingsCol, where("date", "==", selectedDate));
    const querySnapshot = await getDocs(q);
    const bookedHours = [];
    querySnapshot.forEach((doc) => {
        bookedHours.push(doc.data().time);
    });

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    slots.forEach(time => {
        // 1. Filtrar horas pasadas si es hoy
        if (selectedDate === todayStr) {
            if (timeToMinutes(time) <= currentMinutes) return;
        }

        // 2. Filtrar horas ya reservadas en Firestore
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
    setTodayAsDefaultDate();
    updateAvailableTimes();

    // Validaciones de Teléfono (Chile - 9 dígitos)
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
                date: bookingDateInput.getAttribute('data-firebase-date'), // Usar el formato YYYY-MM-DD
                time: bookingTimeSelect.value,
            };

            // Validaciones Finales
            if (!bookingData.name || !bookingData.phone || !bookingData.service || !bookingData.time) {
                showFeedback("Por favor, completa todos los campos obligatorios.", "error");
                return;
            }

            const phoneRegex = /^[0-9]{9}$/;
            if (!phoneRegex.test(bookingData.phone)) {
                showFeedback("Ingresa un teléfono válido de 9 dígitos.", "error");
                return;
            }

            if (bookingData.date < getTodayString()) { // Comparar con el formato YYYY-MM-DD
                showFeedback("Selecciona una fecha válida. Puedes reservar para hoy o para días futuros.", "error");
                return;
            }

            // Verificar disponibilidad en tiempo real antes de guardar
            const q = query(bookingsCol, where("date", "==", bookingData.date), where("time", "==", bookingData.time));
            const checkSnapshot = await getDocs(q);
            
            if (!checkSnapshot.empty) {
                showFeedback("Esta hora ya no está disponible. Elige otra.", "error");
                updateAvailableTimes(); // Actualizar por si acaso otra reserva entró
                return;
            }

            try {
                await addDoc(bookingsCol, {
                    ...bookingData,
                    createdAt: serverTimestamp()
                });
                
                console.log("Reserva guardada en base de datos.");
                
                showFeedback("¡Reserva solicitada con éxito! Te contactaremos para confirmar.", "success");
            } catch (error) {
                console.error("Error Firebase:", error);
                showFeedback("Error al procesar la reserva. Intenta nuevamente.", "error");
                return;
            }

            bookingForm.reset();
            setTodayAsDefaultDate();
            // Después de resetear el formulario, el input de fecha puede perder su valor.
            // Aseguramos que el valor de visualización y el data-attribute se restablezcan.
            const todayFirebaseFormat = getTodayString();
            bookingDateInput.setAttribute('data-firebase-date', todayFirebaseFormat);
            const [y, m, d] = todayFirebaseFormat.split('-');
            bookingDateInput.value = `${d}-${m}-${y}`;
            updateAvailableTimes();
        });
    }
}