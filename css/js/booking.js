// Booking functionality for Rwanda Air website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking functionality
    initBooking();
    
    // Check if user is logged in (for personalized experience)
    const userData = localStorage.getItem('rwandair_user');
    if (userData) {
        const user = JSON.parse(userData);
        console.log(`Welcome back, ${user.name}!`);
    }
});

function initBooking() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Handle tab-specific functionality
            const tab = this.getAttribute('data-tab');
            handleTabChange(tab);
        });
    });
    
    // Passenger counter
    const passengerBtns = document.querySelectorAll('.passenger-btn');
    passengerBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const action = this.getAttribute('data-action');
            updatePassengerCount(type, action);
        });
    });
    
    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Set minimum date for departure to today
    const today = new Date().toISOString().split('T')[0];
    const departureInput = document.getElementById('departure');
    if (departureInput) {
        departureInput.setAttribute('min', today);
        
        // Set return date minimum to departure date
        departureInput.addEventListener('change', function() {
            const returnInput = document.getElementById('return');
            if (returnInput) {
                returnInput.setAttribute('min', this.value);
            }
        });
    }
    
    // Initialize passenger count display
    updatePassengerDisplay();
}

function handleTabChange(tab) {
    const returnDateGroup = document.getElementById('returnDateGroup');
    
    if (tab === 'one-way') {
        // Hide return date for one-way
        returnDateGroup.style.display = 'none';
        document.getElementById('return').removeAttribute('required');
    } else if (tab === 'round-trip') {
        // Show return date for round trip
        returnDateGroup.style.display = 'block';
        document.getElementById('return').setAttribute('required', 'true');
    } else if (tab === 'multi-city') {
        // Show return date for multi-city (handled differently in a real app)
        returnDateGroup.style.display = 'block';
        document.getElementById('return').setAttribute('required', 'true');
        // In a real app, we would show additional city inputs here
    }
}

function updatePassengerCount(type, action) {
    // Get current count
    let countElement = document.getElementById(`${type}Count`);
    let currentCount = parseInt(countElement.textContent);
    
    // Update based on action
    if (action === 'increase') {
        // Limit maximum passengers
        if (currentCount < 9) {
            countElement.textContent = currentCount + 1;
        }
    } else if (action === 'decrease') {
        // Limit minimum passengers (0 for children/infants, 1 for adults)
        if (type === 'adults') {
            if (currentCount > 1) {
                countElement.textContent = currentCount - 1;
            }
        } else {
            if (currentCount > 0) {
                countElement.textContent = currentCount - 1;
            }
        }
    }
    
    // Update display
    updatePassengerDisplay();
}

function updatePassengerDisplay() {
    // Get counts
    const adults = parseInt(document.getElementById('adultsCount').textContent);
    const children = parseInt(document.getElementById('childrenCount').textContent);
    const infants = parseInt(document.getElementById('infantsCount').textContent);
    
    // Calculate total
    const total = adults + children + infants;
    
    // Update display
    const passengerCountElement = document.getElementById('passengerCount');
    if (total === 1) {
        passengerCountElement.textContent = '1 Passenger';
    } else {
        passengerCountElement.textContent = `${total} Passengers`;
    }
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const departure = document.getElementById('departure').value;
    const returnDate = document.getElementById('return').value;
    const flightClass = document.getElementById('class').value;
    
    // Get passenger counts
    const adults = parseInt(document.getElementById('adultsCount').textContent);
    const children = parseInt(document.getElementById('childrenCount').textContent);
    const infants = parseInt(document.getElementById('infantsCount').textContent);
    
    // Get active tab
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    
    // Validate form
    if (!from || !to) {
        showAlert('Please select departure and destination cities', 'error');
        return;
    }
    
    if (from === to) {
        showAlert('Departure and destination cannot be the same', 'error');
        return;
    }
    
    if (!departure) {
        showAlert('Please select a departure date', 'error');
        return;
    }
    
    if (activeTab !== 'one-way' && !returnDate) {
        showAlert('Please select a return date', 'error');
        return;
    }
    
    if (activeTab !== 'one-way' && returnDate <= departure) {
        showAlert('Return date must be after departure date', 'error');
        return;
    }
    
    // Show searching message
    showAlert('Searching for available flights...', 'info');
    
    // Simulate API call delay
    setTimeout(() => {
        // Generate mock flight results
        const flights = generateMockFlights(from, to, departure, returnDate, flightClass, adults + children + infants);
        
        // Display results
        displayFlightResults(flights);
        
        // Scroll to results
        document.getElementById('flightResults').scrollIntoView({ behavior: 'smooth' });
    }, 1500);
}

function generateMockFlights(from, to, departure, returnDate, flightClass, passengers) {
    // Mock flight data
    const airlines = ['Rwanda Air', 'Partner Airlines'];
    const flightNumbers = ['WB 501', 'WB 602', 'WB 703', 'WB 804'];
    
    // Map airport codes to city names
    const airportNames = {
        'KGL': 'Kigali',
        'NBO': 'Nairobi',
        'JNB': 'Johannesburg',
        'ADD': 'Addis Ababa',
        'DXB': 'Dubai',
        'CDG': 'Paris',
        'LHR': 'London',
        'JFK': 'New York'
    };
    
    // Generate flights for departure
    const departureFlights = [];
    for (let i = 0; i < 3; i++) {
        // Generate random times
        const hour = 6 + Math.floor(Math.random() * 12); // Between 6am and 6pm
        const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Calculate duration (3-12 hours depending on destination)
        let durationHours;
        if (to === 'DXB' || to === 'ADD') {
            durationHours = 3 + Math.floor(Math.random() * 2); // 3-4 hours
        } else if (to === 'JNB' || to === 'NBO') {
            durationHours = 2 + Math.floor(Math.random() * 2); // 2-3 hours
        } else if (to === 'CDG' || to === 'LHR') {
            durationHours = 8 + Math.floor(Math.random() * 2); // 8-9 hours
        } else if (to === 'JFK') {
            durationHours = 12 + Math.floor(Math.random() * 2); // 12-13 hours
        } else {
            durationHours = 4 + Math.floor(Math.random() * 4); // 4-7 hours
        }
        
        // Calculate price based on class and destination
        let basePrice;
        if (to === 'DXB' || to === 'ADD') {
            basePrice = 350;
        } else if (to === 'JNB' || to === 'NBO') {
            basePrice = 250;
        } else if (to === 'CDG' || to === 'LHR') {
            basePrice = 700;
        } else if (to === 'JFK') {
            basePrice = 900;
        } else {
            basePrice = 500;
        }
        
        // Adjust price based on class
        let classMultiplier = 1;
        if (flightClass === 'premium') classMultiplier = 1.5;
        if (flightClass === 'business') classMultiplier = 2.5;
        if (flightClass === 'first') classMultiplier = 4;
        
        // Calculate final price
        const price = Math.round(basePrice * classMultiplier * passengers);
        
        departureFlights.push({
            id: `dep-${i}`,
            flightNumber: flightNumbers[i],
            airline: airlines[i % airlines.length],
            from: airportNames[from] || from,
            to: airportNames[to] || to,
            departureTime: time,
            departureDate: departure,
            duration: `${durationHours}h ${Math.floor(Math.random() * 60)}m`,
            price: price,
            class: flightClass,
            seatsAvailable: Math.floor(Math.random() * 20) + 5
        });
    }
    
    // Generate return flights if round trip
    let returnFlights = [];
    if (returnDate) {
        for (let i = 0; i < 2; i++) {
            const hour = 8 + Math.floor(Math.random() * 10);
            const minute = Math.floor(Math.random() * 4) * 15;
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            returnFlights.push({
                id: `ret-${i}`,
                flightNumber: flightNumbers[i + 1],
                airline: airlines[(i + 1) % airlines.length],
                from: airportNames[to] || to,
                to: airportNames[from] || from,
                departureTime: time,
                departureDate: returnDate,
                duration: 'Similar to outbound',
                price: departureFlights[i].price,
                class: flightClass,
                seatsAvailable: Math.floor(Math.random() * 15) + 3
            });
        }
    }
    
    return {
        departure: departureFlights,
        return: returnFlights
    };
}

function displayFlightResults(flights) {
    // Show results section
    const resultsSection = document.getElementById('flightResults');
    resultsSection.style.display = 'block';
    
    // Get container
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    // Display departure flights
    if (flights.departure.length > 0) {
        const departureTitle = document.createElement('h3');
        departureTitle.textContent = 'Outbound Flights';
        departureTitle.style.marginTop = '30px';
        departureTitle.style.marginBottom = '20px';
        container.appendChild(departureTitle);
        
        flights.departure.forEach(flight => {
            const flightElement = createFlightElement(flight);
            container.appendChild(flightElement);
        });
    }
    
    // Display return flights if available
    if (flights.return && flights.return.length > 0) {
        const returnTitle = document.createElement('h3');
        returnTitle.textContent = 'Return Flights';
        returnTitle.style.marginTop = '40px';
        returnTitle.style.marginBottom = '20px';
        container.appendChild(returnTitle);
        
        flights.return.forEach(flight => {
            const flightElement = createFlightElement(flight);
            container.appendChild(flightElement);
        });
    }
    
    // Show message if no flights found
    if (flights.departure.length === 0 && (!flights.return || flights.return.length === 0)) {
        const noFlights = document.createElement('div');
        noFlights.className = 'no-flights';
        noFlights.innerHTML = `
            <i class="fas fa-plane-slash" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
            <h3>No flights found</h3>
            <p>We couldn't find any flights matching your criteria. Try adjusting your search.</p>
        `;
        noFlights.style.textAlign = 'center';
        noFlights.style.padding = '40px 20px';
        container.appendChild(noFlights);
    }
}

function createFlightElement(flight) {
    const element = document.createElement('div');
    element.className = 'result-card';
    element.innerHTML = `
        <div class="result-info">
            <div class="result-route">
                <div class="result-from">
                    <div class="result-time">${flight.departureTime}</div>
                    <div class="result-place">${flight.from} (${flight.from.substring(0, 3).toUpperCase()})</div>
                </div>
                <div class="result-duration">
                    <i class="fas fa-plane"></i>
                    <span>${flight.duration}</span>
                </div>
                <div class="result-to">
                    <div class="result-time">${calculateArrivalTime(flight.departureTime, flight.duration)}</div>
                    <div class="result-place">${flight.to} (${flight.to.substring(0, 3).toUpperCase()})</div>
                </div>
            </div>
            <div class="result-details">
                <span class="flight-number">${flight.flightNumber}</span> • 
                <span class="airline">${flight.airline}</span> • 
                <span class="flight-class">${flight.class.charAt(0).toUpperCase() + flight.class.slice(1)} Class</span> • 
                <span class="seats">${flight.seatsAvailable} seats left</span>
            </div>
        </div>
        <div class="result-price">
            <h3>$${flight.price}</h3>
            <p>Total for all passengers</p>
            <button class="btn-primary select-flight" data-flight='${JSON.stringify(flight)}'>Select Flight</button>
        </div>
    `;
    
    // Add event listener to select button
    element.querySelector('.select-flight').addEventListener('click', function() {
        const flightData = JSON.parse(this.getAttribute('data-flight'));
        selectFlight(flightData);
    });
    
    return element;
}

function calculateArrivalTime(departureTime, duration) {
    // Simple calculation for demo
    const [hours, minutes] = departureTime.split(':').map(Number);
    
    // Extract hours from duration string
    let durationHours = 0;
    if (duration.includes('h')) {
        durationHours = parseInt(duration.split('h')[0]);
    }
    
    // Extract minutes from duration string
    let durationMinutes = 0;
    if (duration.includes('m')) {
        const minutesPart = duration.split('h')[1] || duration;
        durationMinutes = parseInt(minutesPart.split('m')[0]) || 0;
    }
    
    // Calculate arrival time
    let arrivalHours = hours + durationHours;
    let arrivalMinutes = minutes + durationMinutes;
    
    // Handle overflow
    if (arrivalMinutes >= 60) {
        arrivalHours += Math.floor(arrivalMinutes / 60);
        arrivalMinutes = arrivalMinutes % 60;
    }
    
    if (arrivalHours >= 24) {
        arrivalHours = arrivalHours % 24;
    }
    
    return `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`;
}

function selectFlight(flight) {
    // Store selected flight in localStorage
    localStorage.setItem('rwandair_selected_flight', JSON.stringify(flight));
    
    // Check if user is logged in
    const userData = localStorage.getItem('rwandair_user');
    
    if (userData) {
        // If logged in, proceed to booking confirmation
        showAlert(`Selected ${flight.flightNumber} to ${flight.to}. Proceeding to booking details...`, 'success');
        
        // In a real app, this would redirect to a booking confirmation page
        setTimeout(() => {
            // For demo, just show a confirmation
            const confirmed = confirm(`Confirm booking for ${flight.flightNumber} from ${flight.from} to ${flight.to} on ${flight.departureDate} at ${flight.departureTime} for $${flight.price}?`);
            
            if (confirmed) {
                showAlert('Booking confirmed! Check your dashboard for details.', 'success');
                
                // Simulate adding to user's bookings
                const user = JSON.parse(userData);
                user.bookings = user.bookings || [];
                user.bookings.push({
                    flight: flight.flightNumber,
                    from: flight.from,
                    to: flight.to,
                    date: flight.departureDate,
                    time: flight.departureTime,
                    price: flight.price,
                    status: 'Confirmed'
                });
                
                localStorage.setItem('rwandair_user', JSON.stringify(user));
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
        }, 1000);
    } else {
        // If not logged in, redirect to login
        showAlert('Please login to complete your booking', 'info');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Reuse showAlert function from auth.js
function showAlert(message, type) {
    // Check if alert function already exists from auth.js
    if (typeof window.showAlert === 'function') {
        window.showAlert(message, type);
        return;
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Style the alert
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        alert.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        alert.style.backgroundColor = '#dc3545';
    } else if (type === 'info') {
        alert.style.backgroundColor = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(alert);
    
    // Remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 3000);
}