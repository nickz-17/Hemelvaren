// Wacht tot de volledige HTML-pagina geladen is
document.addEventListener('DOMContentLoaded', function() {
    
    // Start de countdown timer
    startCountdown();

    // Haal de weersinformatie op
    fetchWeatherData();

});

// --- Countdown Timer Functie ---
function startCountdown() {
    const festivalDate = new Date("July 8, 2025 20:00:00").getTime();
    const countdownElement = document.getElementById("countdown");

    // Controleer of het countdown-element wel op de pagina bestaat
    if (!countdownElement) {
        console.warn('Element met ID "countdown" niet gevonden. De countdown timer wordt niet gestart.');
        return; 
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = festivalDate - now;

        if (timeLeft <= 0) {
            countdownElement.innerHTML = "Het festival is begonnen!";
            clearInterval(countdownInterval); // Stop de interval als de tijd om is
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${days}d ${hours}u ${minutes}m ${seconds}s`;
    }

    // Roep updateCountdown direct aan voor de eerste weergave
    updateCountdown(); 
    // Start de interval om elke seconde te updaten
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// --- Weer API Functie ---
function fetchWeatherData() {
    const apiKey = '9b41532e75a9d1f71bfcd87717b3a4b8'; // <-- BELANGRIJK: Jouw API-sleutel hier!
    const city = 'Groningen'; // Stad waarvoor je het weer wilt
    const countryCode = 'NL';  // Landcode
    const lang = 'nl';         // Taal voor de omschrijving (Nederlands)
    const units = 'metric';    // Voor temperatuur in Celsius

    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${apiKey}&units=${units}&lang=${lang}`;

    const weatherDiv = document.getElementById('weather-info');

    // Controleer of het weather-info element wel op de pagina bestaat
    if (!weatherDiv) {
        console.warn('Element met ID "weather-info" niet gevonden. Weersinformatie wordt niet geladen.');
        return;
    }

    // Controleer of de API-sleutel is ingevuld
    if (apiKey === 'VERVANG_DIT_DOOR_JOUW_API_SLEUTEL' || apiKey.trim() === '') {
        weatherDiv.innerHTML = '<p style="color: yellow;">API-sleutel voor weer niet ingesteld in script.js!</p>';
        console.error('OpenWeatherMap API-sleutel niet ingesteld in script.js.');
        return;
    }

    fetch(weatherApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API Fout: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log(data); // Handig voor debuggen: bekijk de volledige data

            const temperature = data.main.temp;
            const description = data.weather[0].description;
            const iconCode = data.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

            weatherDiv.innerHTML = `
                <div class="weather-widget">
                    <img src="${iconUrl}" alt="${description}" class="weather-icon">
                    <p class="weather-temp">${Math.round(temperature)}°C</p>
                    <p class="weather-desc">${description}</p>
                </div>
            `;
        })
        .catch(error => {
            console.error('Fout bij het ophalen van weersinformatie:', error);
            weatherDiv.innerHTML = '<p style="color: red;">Kon het weerbericht niet laden.</p>';
            // Extra debug info:
            if (error.message.includes('401')) {
                 weatherDiv.innerHTML += '<p style="color: orange; font-size: 0.8em;">(Mogelijk is je API-sleutel ongeldig of nog niet geactiveerd)</p>';
            } else if (error.message.includes('Failed to fetch')) {
                 weatherDiv.innerHTML += '<p style="color: orange; font-size: 0.8em;">(Controleer je internetverbinding en of de API-sleutel correct is)</p>';
            }
        });
}
