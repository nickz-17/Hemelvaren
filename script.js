// Wacht tot de volledige HTML-pagina geladen is
document.addEventListener('DOMContentLoaded', function() {
    
    // Start de countdown timer (als je die wilt gebruiken)
    // startCountdown(); // Haal commentaar weg als je de countdown actief wilt hebben

    // Haal de weersinformatie op
    fetchWeatherForecast();

});

// --- Countdown Timer Functie ---
function startCountdown() {
    const festivalDate = new Date("July 8, 2025 20:00:00").getTime();
    const countdownElement = document.getElementById("countdown");

    if (!countdownElement) {
        // console.warn('Element met ID "countdown" niet gevonden. Countdown timer wordt niet gestart.');
        return; 
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = festivalDate - now;

        if (timeLeft <= 0) {
            countdownElement.innerHTML = "Het festival is begonnen!";
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${days}d ${hours}u ${minutes}m ${seconds}s`;
    }
    updateCountdown(); 
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// --- Weer API Functie (nu voor voorspelling) ---
function fetchWeatherForecast() {
    const apiKey = '9b41532e75a9d1f71bfcd87717b3a4b8'; // JOUW API SLEUTEL
    const city = 'Groningen'; 
    const countryCode = 'NL';  
    const lang = 'nl';         
    const units = 'metric';    

    // NIEUWE API URL voor 5-daagse voorspelling
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${countryCode}&appid=${apiKey}&units=${units}&lang=${lang}`;

    const weatherDiv = document.getElementById('weather-info');

    if (!weatherDiv) {
        console.warn('Element met ID "weather-info" niet gevonden. Weersinformatie wordt niet geladen.');
        return;
    }

    if (apiKey === 'VERVANG_DIT_DOOR_JOUW_API_SLEUTEL' || apiKey.trim() === '' || apiKey === '9b41532e75a9d1f71bfcd87717b3a4b8') { // Controleer of de placeholder nog gebruikt wordt
        weatherDiv.innerHTML = '<p style="color: yellow;">Gebruik je eigen API-sleutel in script.js!</p>';
        console.error('OpenWeatherMap API-sleutel niet correct ingesteld in script.js.');
        if(apiKey === '9b41532e75a9d1f71bfcd87717b3a4b8'){
             weatherDiv.innerHTML += '<p style="font-size:0.8em; color:orange;">(De getoonde sleutel is een voorbeeld, gebruik je eigen sleutel van OpenWeatherMap)</p>';
        }
        return;
    }

    fetch(forecastApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API Fout: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log(data); // Bekijk de volledige data (een lijst met voorspellingen)

            // We nemen de voorspelling voor ongeveer 24 uur vooruit (8e item in de lijst, want 8 * 3 uur = 24 uur)
            // Controleer eerst of de lijst wel data en genoeg items bevat
            if (data.list && data.list.length > 7) {
                const forecastEntry = data.list[7]; // Index 7 voor ~24u vooruit
                
                const temperature = forecastEntry.main.temp;
                const description = forecastEntry.weather[0].description;
                const iconCode = forecastEntry.weather[0].icon;
                const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
                
                // Datum en tijd van de voorspelling formatteren
                const forecastDateTime = new Date(forecastEntry.dt * 1000); // dt is in seconden, Date verwacht milliseconden
                const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
                const formattedDateTime = forecastDateTime.toLocaleDateString('nl-NL', options);

                weatherDiv.innerHTML = `
                    <p style="font-size:0.9em; margin-bottom:5px;">Voorspelling voor ${formattedDateTime}:</p>
                    <div class="weather-widget">
                        <img src="${iconUrl}" alt="${description}" class="weather-icon">
                        <p class="weather-temp">${Math.round(temperature)}°C</p>
                        <p class="weather-desc">${description}</p>
                    </div>
                `;
            } else {
                weatherDiv.innerHTML = '<p style="color: orange;">Onvoldoende voorspellingsdata ontvangen.</p>';
            }
        })
        .catch(error => {
            console.error('Fout bij het ophalen van weersvoorspelling:', error);
            weatherDiv.innerHTML = '<p style="color: red;">Kon de weersvoorspelling niet laden.</p>';
            if (error.message.includes('401')) {
                 weatherDiv.innerHTML += '<p style="color: orange; font-size: 0.8em;">(Mogelijk is je API-sleutel ongeldig of nog niet geactiveerd)</p>';
            } else if (error.message.includes('Failed to fetch')) {
                 weatherDiv.innerHTML += '<p style="color: orange; font-size: 0.8em;">(Controleer je internetverbinding)</p>';
            }
        });
}
