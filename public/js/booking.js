const checkInInput = document.getElementById("checkInDate");
const checkOutInput = document.getElementById("checkOutDate");
const guestInput = document.querySelector("input[name='guests']");

const priceDetails = document.getElementById("price-details");
const nightDisplay = document.getElementById("total-nights");
const basePriceDisplay = document.getElementById("base-price");
const serviceFeeDisplay = document.getElementById("service-fee");
const totalPriceDisplay = document.getElementById("total-price");

// --- CALCULATION FUNCTION (Ye tera perfect tha) ---
function updatePrice() {
    // Check agar inputs exist karte hain (Error handling)
    if(!checkInInput._flatpickr || !checkOutInput._flatpickr) return;

    const checkIn = checkInInput._flatpickr.selectedDates[0];
    const checkOut = checkOutInput._flatpickr.selectedDates[0];

    if (checkIn && checkOut && checkOut > checkIn) {
        const diffTime = Math.abs(checkOut - checkIn);
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const basePrice = nights * pricePerNight;
        const serviceFee = Math.floor(basePrice * 0.10); 
        const totalPrice = basePrice + serviceFee;

        nightDisplay.innerText = nights;
        basePriceDisplay.innerText = basePrice.toLocaleString("en-IN");
        serviceFeeDisplay.innerText = serviceFee.toLocaleString("en-IN");
        totalPriceDisplay.innerText = totalPrice.toLocaleString("en-IN");

        priceDetails.classList.remove("d-none");
    } else {
        priceDetails.classList.add("d-none");
    }
}

// --- INITIALIZE CALENDAR ---
fetch(`/bookings/${listingId}`) // listingId EJS se aa raha hai na?
    .then(response => response.json())
    .then(data => {
        
        // --- 🔴 IMPORTANT FIX HERE 🔴 ---
        // Hum Backend ke data ko process karke ek simple dates ka list banayenge.
        // Logic: Start Date se lekar End Date se EK DIN PEHLE tak block karo.
        
        let disabledDates = [];

        data.forEach(booking => {
            let currentDate = new Date(booking.from); // Start: 22nd
            let endDate = new Date(booking.to);       // End: 26th

            // Loop: 22, 23, 24, 25 (26 ko chhod dega)
            while (currentDate < endDate) {
                // Date ko string format (YYYY-MM-DD) mein store karo
                disabledDates.push(currentDate.toISOString().split('T')[0]);
                
                // Next day par jao
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        // --- Flatpickr Initialize ---
        
        const commonConfig = {
            dateFormat: "Y-m-d",
            minDate: "today",
            disable: disabledDates, // Ab humne processed list pass ki hai
        };

        const fpCheckIn = flatpickr(checkInInput, {
            ...commonConfig,
            onChange: function (selectedDates, dateStr, instance) {
                // Check-in select hote hi Check-out khul jaye
                fpCheckOut.set("minDate", dateStr);
                fpCheckOut.open();
                updatePrice();
            }
        });

        const fpCheckOut = flatpickr(checkOutInput, {
            ...commonConfig,
            onChange: function () {
                updatePrice();
            }
        });
    })
    .catch(err => console.error("Error fetching bookings:", err));

// Guests change hone par update
if(guestInput) {
    guestInput.addEventListener("input", updatePrice);
}