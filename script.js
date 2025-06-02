// wacht tot de volledige html-pagina geladen is
document.addEventListener('DOMContentLoaded', function() {
    
    // start de countdown timer als je die wilt gebruiken
    // startCountdown(); // haal commentaar weg als je de countdown actief wilt hebben

    // haal de weersinformatie op
    fetchWeatherForecast();

});

// --- countdown timer functie ---
function startCountdown() {
    const festivalDate = new Date("July 8, 2025 20:00:00").getTime();
    const countdownElement = document.getElementById("countdown");

    if (!countdownElement) {
        // console.warn('element met id "countdown" niet gevonden countdown timer wordt niet gestart');
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

// --- weer api functie nu voor 5-daagse voorspelling ---
function fetchWeatherForecast() {
    const apiKey = 'c90e570c17d996f69ce185c8fd8d6b16'; // zorg dat dit jouw eigen actieve api-sleutel is
    const city = 'Groningen'; 
    const countryCode = 'NL';  
    const lang = 'nl';         
    const units = 'metric';    

    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${countryCode}&appid=${apiKey}&units=${units}&lang=${lang}`;

    const weatherDiv = document.getElementById('weather-info');

    if (!weatherDiv) {
        console.warn('element met id "weather-info" niet gevonden weersinformatie wordt niet geladen');
        return;
    }

    // basis check of er een api key is
    if (apiKey.trim() === '' || apiKey === 'VERVANG_DIT_DOOR_JOUW_API_SLEUTEL') { 
        weatherDiv.innerHTML = '<p style="color: yellow;">api-sleutel voor weer niet correct ingesteld in script js</p>';
        console.error('openweathermap api-sleutel niet ingesteld of nog placeholder in script js');
        return;
    }

    fetch(forecastApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`api fout ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log(data); 

            if (data.list && data.list.length > 0) {
                let forecastOutputHtml = '<div class="forecast-container">';
                const processedDates = new Set(); 

                for (let i = 0; i < data.list.length && processedDates.size < 5; i++) {
                    const entry = data.list[i];
                    const forecastDateTime = new Date(entry.dt * 1000);
                    const forecastDateStr = forecastDateTime.toLocaleDateString('nl-NL');
                    const forecastHour = forecastDateTime.getHours();

                    if (!processedDates.has(forecastDateStr) && (forecastHour >= 12 && forecastHour <= 14)) {
                        processedDates.add(forecastDateStr); 

                        const dayName = forecastDateTime.toLocaleDateString('nl-NL', { weekday: 'short' });
                        const temperature = entry.main.temp;
                        const description = entry.weather[0].description;
                        const iconCode = entry.weather[0].icon;
                        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

                        forecastOutputHtml += `
                            <div class="forecast-day">
                                <p class="forecast-day-name">${dayName}</p>
                                <img src="${iconUrl}" alt="${description}" class="weather-icon forecast-icon-small">
                                <p class="weather-temp forecast-temp-small">${Math.round(temperature)}°C</p>
                                <p class="weather-desc forecast-desc-small">${description}</p>
                            </div>
                        `;
                    }
                }
                // fallback als er minder dan 5 'middag'-voorspellingen zijn gevonden
                if (processedDates.size < 5) {
                    for (let i = 0; i < data.list.length && processedDates.size < 5; i++) {
                         const entry = data.list[i];
                         const forecastDateTime = new Date(entry.dt * 1000);
                         const forecastDateStr = forecastDateTime.toLocaleDateString('nl-NL');

                         if (!processedDates.has(forecastDateStr)) { // voeg alleen toe als de dag nog niet is verwerkt
                            processedDates.add(forecastDateStr);
                            const dayName = forecastDateTime.toLocaleDateString('nl-NL', { weekday: 'short' });
                            const timeStr = forecastDateTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit'});
                            const temperature = entry.main.temp;
                            const description = entry.weather[0].description;
                            const iconCode = entry.weather[0].icon;
                            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
                            forecastOutputHtml += `
                                <div class="forecast-day">
                                    <p class="forecast-day-name">${dayName} ${timeStr}</p>
                                    <img src="${iconUrl}" alt="${description}" class="weather-icon forecast-icon-small">
                                    <p class="weather-temp forecast-temp-small">${Math.round(temperature)}°C</p>
                                    <p class="weather-desc forecast-desc-small">${description}</p>
                                </div>
                            `;
                         }
                    }
                }

                forecastOutputHtml += '</div>';

                if (processedDates.size > 0) {
                    weatherDiv.innerHTML = forecastOutputHtml;
                } else {
                    weatherDiv.innerHTML = '<p style="color: orange;">kon geen geschikte dagelijkse voorspellingen vinden in de data</p>';
                }

            } else {
                weatherDiv.innerHTML = '<p style="color: orange;">onvoldoende voorspellingsdata ontvangen</p>';
            }
        })
        .catch(error => {
            console.error('fout bij het ophalen van weersvoorspelling', error);
            weatherDiv.innerHTML = '<p style="color: red;">kon de weersvoorspelling niet laden</p>';
            if (error.message.includes('401')) { 
                 weatherDiv.innerHTML += '<p style="color: orange; font-size: 0.8em;">(controleer api-sleutel mogelijk ongeldig nog niet actief of e-mail niet bevestigd)</p>';
            } else if (error.message.includes('Failed to fetch')) { 
                 weatherDiv.innerHTML += '<p style="color: orange; font-size: 0.8em;">(controleer je internetverbinding)</p>';
            }
        });
}
