import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCL4gjVqC5U7ozJubOUH0sPiMOw0ByTro",
  authDomain: "barberia-a2feb.firebaseapp.com",
  databaseURL: "https://barberia-a2feb-default-rtdb.firebaseio.com",
  projectId: "barberia-a2feb",
  storageBucket: "barberia-a2feb.firebasestorage.app",
  messagingSenderId: "925004420024",
  appId: "1:925004420024:web:b1080ad083ff3f81fe354d"
};

const ADMIN_PASSWORD = "erio2026";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bookingsCol = collection(db, "bookings");

const loginScreen = document.getElementById("login-screen");
const adminPanel = document.getElementById("admin-panel");
const passwordInput = document.getElementById("admin-password");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginError = document.getElementById("login-error");

const reservasBody = document.getElementById("reservas-body");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const dateFilter = document.getElementById("date-filter");
const todayBtn = document.getElementById("today-btn");
const clearFilterBtn = document.getElementById("clear-filter-btn");
const reloadBtn = document.getElementById("reload-btn");
const totalReservas = document.getElementById("total-reservas");
const reservasHoy = document.getElementById("reservas-hoy");
const fechaSeleccionada = document.getElementById("fecha-seleccionada");

let allBookings = [];

function getTodayString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(dateStr) {
  if (!dateStr || !dateStr.includes("-")) return dateStr || "Sin fecha";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function normalizePhone(phone) {
  const clean = String(phone || "").replace(/\D/g, "");
  if (clean.startsWith("56")) return clean;
  if (clean.length === 9) return `56${clean}`;
  return clean;
}

function showPanel() {
  loginScreen.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  loadBookings();
}

function checkSession() {
  if (localStorage.getItem("erioAdminAccess") === "true") {
    showPanel();
  }
}

loginBtn.addEventListener("click", () => {
  if (passwordInput.value === ADMIN_PASSWORD) {
    localStorage.setItem("erioAdminAccess", "true");
    loginError.textContent = "";
    showPanel();
  } else {
    loginError.textContent = "Contraseña incorrecta.";
  }
});

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("erioAdminAccess");
  location.reload();
});

async function loadBookings() {
  loadingState.textContent = "Cargando...";
  reservasBody.innerHTML = "";

  try {
    const snapshot = await getDocs(bookingsCol);
    allBookings = snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }));
    allBookings.sort((a, b) => `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`));
    renderBookings();
  } catch (error) {
    console.error("Error cargando reservas:", error);
    loadingState.textContent = "Error al cargar reservas. Revisa las reglas de Firestore.";
  }
}

function renderBookings() {
  const selectedDate = dateFilter.value;
  const today = getTodayString();
  const filtered = selectedDate ? allBookings.filter((b) => b.date === selectedDate) : allBookings;

  reservasBody.innerHTML = "";
  totalReservas.textContent = String(allBookings.length);
  reservasHoy.textContent = String(allBookings.filter((b) => b.date === today).length);
  fechaSeleccionada.textContent = selectedDate ? formatDate(selectedDate) : "Todas";

  if (!filtered.length) {
    emptyState.classList.remove("hidden");
    loadingState.textContent = "Sin reservas";
    return;
  }

  emptyState.classList.add("hidden");
  loadingState.textContent = `${filtered.length} reserva(s)`;

  filtered.forEach((booking) => {
    const phone = normalizePhone(booking.phone);
    const whatsappText = encodeURIComponent(`Hola ${booking.name || ""}, te escribo de Erio Barber por tu reserva del ${formatDate(booking.date)} a las ${booking.time}.`);
    const whatsappUrl = `https://wa.me/${phone}?text=${whatsappText}`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(booking.date)}</td>
      <td><strong>${booking.time || "Sin hora"}</strong></td>
      <td class="client-name">${booking.name || "Sin nombre"}</td>
      <td>${booking.phone || "Sin teléfono"}</td>
      <td><span class="service-pill">${booking.service || "Sin servicio"}</span></td>
      <td>${booking.barber || "Erio Barber"}</td>
      <td class="actions-cell">
        <a class="action-btn action-whatsapp" href="${whatsappUrl}" target="_blank" rel="noopener">
          <i class='bx bxl-whatsapp'></i> WhatsApp
        </a>
        <button class="action-btn action-delete" data-id="${booking.id}">
          <i class='bx bx-trash'></i> Eliminar
        </button>
      </td>
    `;
    reservasBody.appendChild(tr);
  });

  document.querySelectorAll(".action-delete").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const ok = confirm("¿Eliminar esta reserva? Esta acción liberará la hora.");
      if (!ok) return;

      button.disabled = true;
      button.textContent = "Eliminando...";

      try {
        await deleteDoc(doc(db, "bookings", id));
        allBookings = allBookings.filter((booking) => booking.id !== id);
        renderBookings();
      } catch (error) {
        console.error("Error eliminando reserva:", error);
        alert("No se pudo eliminar. Revisa que las reglas de Firestore permitan delete.");
        button.disabled = false;
      }
    });
  });
}

dateFilter.addEventListener("change", renderBookings);
reloadBtn.addEventListener("click", loadBookings);

todayBtn.addEventListener("click", () => {
  dateFilter.value = getTodayString();
  renderBookings();
});

clearFilterBtn.addEventListener("click", () => {
  dateFilter.value = "";
  renderBookings();
});

checkSession();
