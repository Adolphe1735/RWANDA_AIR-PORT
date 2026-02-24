// js/booking.js - Enhanced Booking System

class BookingSystem {
    constructor() {
        this.flights = this.loadFlights();
        this.currentBooking = null;
        this.selectedFlight = null;
        this.selectedSeats = [];
        this.passengers = {
            adults: 1,
            children: 0,
            infants: 0
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFromStorage();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Passenger selector
        document.querySelectorAll('.passenger-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const type = btn.dataset.type;
                const action = btn.dataset.action;
                this.updatePassengerCount(type, action);
            });
        });

        // Booking form submission
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.searchFlights();
            });
        }

        // Return date toggle based on trip type
        const tripType = document.querySelector('input[name="tripType"]');
        if (tripType) {
            tripType.addEventListener('change', (e) => {
                this.toggleReturnDate(e.target.value);
            });
        }

        // Currency converter
        const currencySelect = document.getElementById('currency');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => {
                this.convertCurrency(e.target.value);
            });
        }
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Toggle return date field
        const returnDateGroup = document.getElementById('returnDateGroup');
        if (returnDateGroup) {
            returnDateGroup.style.display = tab === 'round-trip' ? 'block' : 'none';
        }
    }

    updatePassengerCount(type, action) {
        const currentValue = this.passengers[type];
        const maxPassengers = type === 'adults' ? 9 : 4;

        if (action === 'increase' && currentValue < maxPassengers) {
            this.passengers[type]++;
        } else if (action === 'decrease' && currentValue > 0) {
            this.passengers[type]--;
        }

        this.updatePassengerDisplay();
    }

    updatePassengerDisplay() {
        const total = this.passengers.adults + this.passengers.children + this.passengers.infants;
        document.getElementById('passengerCount').textContent = 
            `${total} Passenger${total !== 1 ? 's' : ''}`;
        
        document.getElementById('adultsCount').textContent = this.passengers.adults;
        document.getElementById('childrenCount').textContent = this.passengers.children;
        document.getElementById('infantsCount').textContent = this.passengers.infants;
    }

    searchFlights() {
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        const departure = document.getElementById('departure').value;
        const returnDate = document.getElementById('return')?.value;
        const cabinClass = document.getElementById('class').value;

        if (!from || !to || !departure) {
            auth.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (from === to) {
            auth.showToast('Departure and destination cannot be the same', 'error');
            return;
        }

        // Show loading
        document.getElementById('flightResults').style.display = 'block';
        document.getElementById('resultsContainer').innerHTML = `
            <div class="text-center" style="padding: 40px;">
                <div class="spinner"></div>
                <p style="margin-top: 20px;">Searching for flights...</p>
            </div>
        `;

        // Simulate API call
        setTimeout(() => {
            const results = this.getFilteredFlights(from, to, departure, cabinClass);
            this.displayFlightResults(results);
        }, 1500);
    }

    getFilteredFlights(from, to, date, cabinClass) {
        // Filter flights based on criteria
        return this.flights.filter(flight => {
            return flight.from === from && 
                   flight.to === to && 
                   flight.date === date &&
                   flight.availableSeats[cabinClass] > 0;
        });
    }

    displayFlightResults(flights) {
        const container = document.getElementById('resultsContainer');
        
        if (flights.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 40px;">
                    <i class="fas fa-plane-slash" style="font-size: 3rem; color: var(--gray-text);"></i>
                    <h3 style="margin: 20px 0;">No Flights Found</h3>
                    <p>Try adjusting your search criteria or dates</p>
                    <button class="btn-primary" onclick="window.location.reload()">Search Again</button>
                </div>
            `;
            return;
        }

        let html = '';
        flights.forEach(flight => {
            const price = this.calculatePrice(flight);
            html += `
                <div class="flight-card" data-flight-id="${flight.id}">
                    <div class="flight-card-header">
                        <span class="flight-number">${flight.flightNumber}</span>
                        <span class="flight-price">$${price}</span>
                    </div>
                    <div class="flight-route">
                        <div class="flight-from">
                            <h4>${flight.fromCity}</h4>
                            <div class="flight-time">${flight.departureTime}</div>
                            <div class="flight-date">${flight.date}</div>
                        </div>
                        <div class="flight-icon">
                            <i class="fas fa-plane"></i>
                        </div>
                        <div class="flight-to">
                            <h4>${flight.toCity}</h4>
                            <div class="flight-time">${flight.arrivalTime}</div>
                            <div class="flight-date">${flight.date}</div>
                        </div>
                    </div>
                    <div class="flight-duration">
                        <i class="fas fa-clock"></i> Duration: ${flight.duration}
                    </div>
                    <div class="flight-details">
                        <div class="flight-detail-item">
                            <i class="fas fa-chair"></i>
                            <span>${flight.availableSeats.economy} seats available</span>
                        </div>
                        <div class="flight-detail-item">
                            <i class="fas fa-utensils"></i>
                            <span>Meal included</span>
                        </div>
                        <div class="flight-detail-item">
                            <i class="fas fa-wifi"></i>
                            <span>WiFi available</span>
                        </div>
                    </div>
                    <div class="flight-card-footer">
                        <button class="btn-outline" onclick="booking.showFlightDetails(${flight.id})">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                        <button class="btn-primary" onclick="booking.selectFlight(${flight.id})">
                            <i class="fas fa-check"></i> Select Flight
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    selectFlight(flightId) {
        this.selectedFlight = this.flights.find(f => f.id === flightId);
        if (!this.selectedFlight) return;

        // Store in session
        sessionStorage.setItem('selectedFlight', JSON.stringify(this.selectedFlight));

        // Show seat selection modal
        this.showSeatSelection();
    }

    showSeatSelection() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'seatModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Select Your Seats</h2>
                    <button class="close-modal" onclick="document.getElementById('seatModal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <h3>Flight ${this.selectedFlight.flightNumber}</h3>
                    <p>${this.selectedFlight.fromCity} → ${this.selectedFlight.toCity}</p>
                    
                    <div class="seat-map" id="seatMap"></div>
                    
                    <div class="seat-legend" style="display: flex; gap: 20px; margin: 20px 0;">
                        <div><span class="seat" style="width: 20px; height: 20px; display: inline-block;"></span> Available</div>
                        <div><span class="seat selected" style="width: 20px; height: 20px; display: inline-block;"></span> Selected</div>
                        <div><span class="seat occupied" style="width: 20px; height: 20px; display: inline-block;"></span> Occupied</div>
                    </div>

                    <div class="selected-seats-info">
                        <h4>Selected Seats: <span id="selectedSeatsCount">0</span></h4>
                        <div id="selectedSeatsList"></div>
                    </div>

                    <div class="meal-preferences" style="margin-top: 20px;">
                        <h4>Meal Preferences</h4>
                        <select id="mealPreference" class="form-control">
                            <option value="regular">Regular Meal</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="halal">Halal</option>
                            <option value="kids">Kids Meal</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('seatModal').remove()">Cancel</button>
                    <button class="btn-primary" onclick="booking.confirmSeats()">Confirm Seats</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.generateSeatMap();
    }

    generateSeatMap() {
        const seatMap = document.getElementById('seatMap');
        if (!seatMap) return;

        const rows = 30;
        const seatsPerRow = 6;
        let seats = '';

        for (let row = 1; row <= rows; row++) {
            for (let seat = 1; seat <= seatsPerRow; seat++) {
                const seatNumber = `${row}${String.fromCharCode(64 + seat)}`;
                const isOccupied = Math.random() > 0.7; // Simulate occupied seats
                const isEmergency = row === 12 || row === 13;
                const isBusiness = row <= 5;

                seats += `
                    <div class="seat ${isOccupied ? 'occupied' : ''} 
                         ${isEmergency ? 'emergency' : ''} 
                         ${isBusiness ? 'business' : ''}"
                         data-seat="${seatNumber}"
                         onclick="booking.toggleSeat(this)">
                        ${seatNumber}
                    </div>
                `;
            }
        }

        seatMap.innerHTML = seats;
    }

    toggleSeat(seatElement) {
        if (seatElement.classList.contains('occupied')) return;

        const seatNumber = seatElement.dataset.seat;
        
        if (seatElement.classList.contains('selected')) {
            seatElement.classList.remove('selected');
            this.selectedSeats = this.selectedSeats.filter(s => s !== seatNumber);
        } else {
            if (this.selectedSeats.length < this.passengers.adults + this.passengers.children) {
                seatElement.classList.add('selected');
                this.selectedSeats.push(seatNumber);
            } else {
                auth.showToast(`You can only select ${this.passengers.adults + this.passengers.children} seats`, 'warning');
            }
        }

        this.updateSelectedSeats();
    }

    updateSelectedSeats() {
        document.getElementById('selectedSeatsCount').textContent = this.selectedSeats.length;
        document.getElementById('selectedSeatsList').innerHTML = this.selectedSeats.join(', ');
    }

    confirmSeats() {
        if (this.selectedSeats.length !== this.passengers.adults + this.passengers.children) {
            auth.showToast(`Please select ${this.passengers.adults + this.passengers.children} seats`, 'warning');
            return;
        }

        this.currentBooking = {
            flight: this.selectedFlight,
            seats: this.selectedSeats,
            passengers: this.passengers,
            mealPreference: document.getElementById('mealPreference').value,
            totalPrice: this.calculateTotalPrice()
        };

        sessionStorage.setItem('currentBooking', JSON.stringify(this.currentBooking));
        document.getElementById('seatModal').remove();

        // Show booking summary
        this.showBookingSummary();
    }

    showBookingSummary() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'summaryModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Booking Summary</h2>
                    <button class="close-modal" onclick="document.getElementById('summaryModal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="booking-summary">
                        <h3>Flight Details</h3>
                        <p><strong>Flight:</strong> ${this.currentBooking.flight.flightNumber}</p>
                        <p><strong>From:</strong> ${this.currentBooking.flight.fromCity}</p>
                        <p><strong>To:</strong> ${this.currentBooking.flight.toCity}</p>
                        <p><strong>Date:</strong> ${this.currentBooking.flight.date}</p>
                        <p><strong>Departure:</strong> ${this.currentBooking.flight.departureTime}</p>
                        <p><strong>Arrival:</strong> ${this.currentBooking.flight.arrivalTime}</p>

                        <h3 style="margin-top: 20px;">Passenger Details</h3>
                        <p><strong>Adults:</strong> ${this.currentBooking.passengers.adults}</p>
                        <p><strong>Children:</strong> ${this.currentBooking.passengers.children}</p>
                        <p><strong>Infants:</strong> ${this.currentBooking.passengers.infants}</p>

                        <h3 style="margin-top: 20px;">Seat Selection</h3>
                        <p><strong>Seats:</strong> ${this.currentBooking.seats.join(', ')}</p>

                        <h3 style="margin-top: 20px;">Meal Preference</h3>
                        <p><strong>Meal:</strong> ${this.currentBooking.mealPreference}</p>

                        <h3 style="margin-top: 20px;">Price Breakdown</h3>
                        <p><strong>Base Fare:</strong> $${this.currentBooking.flight.basePrice * this.currentBooking.passengers.adults}</p>
                        <p><strong>Children Fare:</strong> $${(this.currentBooking.flight.basePrice * 0.75) * this.currentBooking.passengers.children}</p>
                        <p><strong>Taxes & Fees:</strong> $${this.calculateTaxes()}</p>
                        <hr>
                        <p><strong>Total:</strong> $${this.currentBooking.totalPrice}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('summaryModal').remove()">Edit</button>
                    <button class="btn-primary" onclick="booking.completeBooking()">Complete Booking</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    completeBooking() {
        // Save booking to user account
        if (auth.currentUser) {
            const booking = {
                id: Date.now(),
                ...this.currentBooking,
                bookingDate: new Date().toISOString(),
                status: 'confirmed',
                bookingReference: this.generateBookingReference()
            };

            auth.currentUser.bookings.push(booking);
            localStorage.setItem('users', JSON.stringify(auth.users));
            localStorage.setItem('currentUser', JSON.stringify(auth.currentUser));

            document.getElementById('summaryModal').remove();
            auth.showToast(`Booking confirmed! Reference: ${booking.bookingReference}`, 'success');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            auth.showToast('Please login to complete booking', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    }

    generateBookingReference() {
        return 'WB' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    calculatePrice(flight) {
        const basePrice = flight.basePrice || 300;
        const cabinMultiplier = {
            economy: 1,
            premium: 1.5,
            business: 2.5,
            first: 4
        };
        const multiplier = cabinMultiplier[document.getElementById('class')?.value || 'economy'];
        return Math.round(basePrice * multiplier);
    }

    calculateTotalPrice() {
        const basePrice = this.selectedFlight.basePrice;
        const adultTotal = basePrice * this.passengers.adults;
        const childTotal = (basePrice * 0.75) * this.passengers.children;
        const infantTotal = basePrice * 0.1 * this.passengers.infants;
        const taxes = this.calculateTaxes();
        
        return adultTotal + childTotal + infantTotal + taxes;
    }

    calculateTaxes() {
        const subtotal = this.selectedFlight.basePrice * 
            (this.passengers.adults + this.passengers.children * 0.75 + this.passengers.infants * 0.1);
        return Math.round(subtotal * 0.15); // 15% taxes
    }

    showFlightDetails(flightId) {
        const flight = this.flights.find(f => f.id === flightId);
        if (!flight) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Flight Details</h2>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <h3>${flight.flightNumber}</h3>
                    <p><strong>Aircraft:</strong> ${flight.aircraft || 'Boeing 737-800'}</p>
                    <p><strong>Duration:</strong> ${flight.duration}</p>
                    <p><strong>Baggage Allowance:</strong> 23kg checked, 7kg carry-on</p>
                    <p><strong>In-flight Entertainment:</strong> Yes</p>
                    <p><strong>Power Outlets:</strong> Yes</p>
                    <p><strong>WiFi:</strong> Available for purchase</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    loadFlights() {
        // Sample flight data
        return [
            {
                id: 1,
                flightNumber: 'WB101',
                from: 'KGL',
                fromCity: 'Kigali',
                to: 'NBO',
                toCity: 'Nairobi',
                date: '2024-03-20',
                departureTime: '08:30',
                arrivalTime: '10:15',
                duration: '1h 45m',
                basePrice: 350,
                aircraft: 'Boeing 737-800',
                availableSeats: {
                    economy: 45,
                    premium: 12,
                    business: 8,
                    first: 4
                }
            },
            {
                id: 2,
                flightNumber: 'WB202',
                from: 'KGL',
                fromCity: 'Kigali',
                to: 'JNB',
                toCity: 'Johannesburg',
                date: '2024-03-20',
                departureTime: '12:45',
                arrivalTime: '16:30',
                duration: '3h 45m',
                basePrice: 450,
                aircraft: 'Airbus A330',
                availableSeats: {
                    economy: 32,
                    premium: 8,
                    business: 6,
                    first: 2
                }
            },
            {
                id: 3,
                flightNumber: 'WB303',
                from: 'KGL',
                fromCity: 'Kigali',
                to: 'DXB',
                toCity: 'Dubai',
                date: '2024-03-20',
                departureTime: '22:15',
                arrivalTime: '06:30',
                duration: '6h 15m',
                basePrice: 650,
                aircraft: 'Boeing 787 Dreamliner',
                availableSeats: {
                    economy: 78,
                    premium: 24,
                    business: 16,
                    first: 8
                }
            },
            {
                id: 4,
                flightNumber: 'WB404',
                from: 'KGL',
                fromCity: 'Kigali',
                to: 'CDG',
                toCity: 'Paris',
                date: '2024-03-20',
                departureTime: '20:00',
                arrivalTime: '08:30',
                duration: '8h 30m',
                basePrice: 890,
                aircraft: 'Airbus A350',
                availableSeats: {
                    economy: 56,
                    premium: 18,
                    business: 12,
                    first: 6
                }
            }
        ];
    }

    loadFromStorage() {
        const saved = sessionStorage.getItem('currentBooking');
        if (saved) {
            this.currentBooking = JSON.parse(saved);
        }
    }

    toggleReturnDate(tripType) {
        const returnDateGroup = document.getElementById('returnDateGroup');
        if (returnDateGroup) {
            returnDateGroup.style.display = tripType === 'roundtrip' ? 'block' : 'none';
        }
    }

    convertCurrency(currency) {
        // Simulate currency conversion
        const rates = {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            RWF: 1300,
            KES: 130
        };

        const rate = rates[currency] || 1;
        document.querySelectorAll('.flight-price').forEach(el => {
            const price = parseFloat(el.textContent.replace('$', ''));
            el.textContent = `${currency} ${Math.round(price * rate)}`;
        });
    }
}

// Initialize booking system
const booking = new BookingSystem();
