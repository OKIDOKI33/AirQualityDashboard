const API_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const API_KEY = 'your_openweather_api_key'; // Replace with your actual API key
const LAT = 40.7128; // Latitude (e.g., for New York)
const LON = -74.0060; // Longitude

// Fetch Real-Time Data
async function fetchAirQualityData() {
    try {
        const response = await fetch(`${API_URL}?lat=${LAT}&lon=${LON}&appid=${API_KEY}`);
        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error("Error fetching air quality data:", error);
    }
}

// Update the Dashboard
function updateDashboard(data) {
    const airQualityMetrics = [
        { name: "PM2.5", value: `${data.list[0].components.pm2_5} µg/m³` },
        { name: "PM10", value: `${data.list[0].components.pm10} µg/m³` },
        { name: "CO2", value: `${data.list[0].components.co} ppm` },
        { name: "NOx", value: `${data.list[0].components.no2} ppb` },
        { name: "O3", value: `${data.list[0].components.o3} ppb` },
    ];

    const dataDisplay = document.getElementById('data-display');
    dataDisplay.innerHTML = ""; // Clear old data

    airQualityMetrics.forEach((metric) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${metric.name}</h3><p>${metric.value}</p>`;
        dataDisplay.appendChild(card);
    });
}

// Refresh Data Every Minute
setInterval(fetchAirQualityData, 60000); // 60 seconds
fetchAirQualityData(); // Initial call