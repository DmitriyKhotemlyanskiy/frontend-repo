let API_BASE_URL = "";

// 1. Load configuration dynamically on startup (DevOps Friendly)
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        API_BASE_URL = config.API_BASE_URL;
        console.log("Config loaded. Backend target URL:", API_BASE_URL);
        
        // Initial load after config is ready
        fetchHotels();
    } catch (err) {
        console.error("Failed to load config.json, falling back to local host:", err);
        API_BASE_URL = "http://localhost:8080";
        fetchHotels();
    }
}

// 2. Switch screens (Tabs)
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(screenId).classList.add('active');
    event.target.classList.add('active');
}

// 3. Fetch hotels from backend to fill the dropdown list
async function fetchHotels() {
    const select = document.getElementById('hotel-select');
    try {
        const response = await fetch(`${API_BASE_URL}/api/hotels`);
        if (!response.ok) throw new Error("Network response error");
        const hotels = await response.json();
        
        select.innerHTML = '<option value="" disabled selected>Choose a hotel...</option>';
        hotels.forEach(hotel => {
            const option = document.createElement('option');
            option.value = hotel.id;
            option.textContent = `${hotel.name} — ${hotel.location} ($${hotel.price}/night)`;
            select.appendChild(option);
        });
    } catch (err) {
        select.innerHTML = '<option value="" disabled>Error loading hotels. Is backend up?</option>';
    }
}

// 4. Create New Reservation
document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('booking-message');
    
    const payload = {
        hotel_id: document.getElementById('hotel-select').value,
        full_name: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        check_in: document.getElementById('check-in').value,
        check_out: document.getElementById('check-out').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        messageDiv.classList.remove('hidden', 'success', 'error');
        if (response.ok) {
            messageDiv.classList.add('success');
            messageDiv.textContent = `✓ ${data.message}! ID: ${data.id}`;
            document.getElementById('booking-form').reset();
        } else {
            messageDiv.classList.add('error');
            messageDiv.textContent = `Error: ${data.error}`;
        }
    } catch (err) {
        messageDiv.classList.remove('hidden', 'success', 'error');
        messageDiv.classList.add('error');
        messageDiv.textContent = "Cannot connect to the backend server.";
    }
});

// 5. Lookup Reservation by Name or Email
async function searchReservations() {
    const query = document.getElementById('search-input').value;
    const resultsContainer = document.getElementById('search-results');
    if (!query) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/reservations/lookup?search=${encodeURIComponent(query)}`);
        const reservations = await response.json();

        resultsContainer.innerHTML = "";
        if (!response.ok || reservations.length === 0) {
            resultsContainer.innerHTML = '<p class="subtitle" style="text-align:center;">No reservations found.</p>';
            return;
        }

        reservations.forEach(res => {
            const item = document.createElement('div');
            item.className = 'reservation-item';
            item.innerHTML = `
                <div class="res-info">
                    <h4>${res.full_name}</h4>
                    <p>Email: ${res.email}</p>
                    <p>Dates: ${res.check_in} to ${res.check_out}</p>
                </div>
                <button class="btn btn-danger" onclick="cancelReservation('${res.id}')">Cancel</button>
            `;
            resultsContainer.appendChild(item);
        });
    } catch (err) {
        resultsContainer.innerHTML = '<p class="message error">Failed to connect for search.</p>';
    }
}

// 6. Cancel Reservation
async function cancelReservation(id) {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert("Reservation cancelled successfully.");
            searchReservations(); // Refresh search view
        } else {
            const data = await response.json();
            alert(`Error: ${data.error}`);
        }
    } catch (err) {
        alert("Failed to communicate with backend to delete.");
    }
}

// Start orchestration
loadConfig();