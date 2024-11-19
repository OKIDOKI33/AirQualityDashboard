const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const AIR_POLLUTION_URL = "https://api.openweathermap.org/data/2.5/air_pollution";
const API_KEY = "36e882481ab8fff30a504fba20e5e414"; // Replace with your actual API key
const LAT = 35.1796; // Latitude for Busan
const LON = 129.0756; // Longitude for Busan

// Historical Data Arrays
let temperatureHistory = [];
let humidityHistory = [];
let timestampsHistory = [];

// Chart Instances
let lineChart, barChart, doughnutChart;

// Fetch Weather Data (Temperature & Humidity)
async function fetchWeatherData() {
    try {
        const response = await fetch(`${WEATHER_URL}?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
        const data = await response.json();
        return {
            temperature: data.main.temp,
            humidity: data.main.humidity,
        };
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        return null;
    }
}

// Fetch Air Quality Data
async function fetchAirQualityData() {
    try {
        const response = await fetch(`${AIR_POLLUTION_URL}?lat=${LAT}&lon=${LON}&appid=${API_KEY}`);
        if (!response.ok) throw new Error(`Air Pollution API error: ${response.status}`);
        const data = await response.json();
        const components = data.list?.[0]?.components || {};
        return {
            pm25: parseFloat(components.pm2_5) || 0,
            pm10: parseFloat(components.pm10) || 0,
            nox: parseFloat(components.no2) || 0,
            nh3: parseFloat(components.nh3) || 0,
            so2: parseFloat(components.so2) || 0,
            co2: 400, // Placeholder value
            voc: 3, // Placeholder value
        };
    } catch (error) {
        console.error("Error fetching air quality data:", error.message);
        return null;
    }
}

// Line Chart: Temperature and Humidity
function createOrUpdateLineChart(data) {
    const ctx = document.getElementById("lineChart").getContext("2d");
    if (lineChart) {
        lineChart.data.labels = data.timestamps;
        lineChart.data.datasets[0].data = data.temperature;
        lineChart.data.datasets[1].data = data.humidity;
        lineChart.update();
    } else {
        lineChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: data.timestamps,
                datasets: [
                    {
                        label: "Temperature (°C)",
                        data: data.temperature,
                        borderColor: "rgba(255, 99, 132, 1)",
                        fill: false,
                    },
                    {
                        label: "Humidity (%)",
                        data: data.humidity,
                        borderColor: "rgba(54, 162, 235, 1)",
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Temperature and Humidity Trends",
                    },
                },
            },
        });
    }
}

// Bar Chart: Pollutants
function createOrUpdateBarChart(data) {
    const ctx = document.getElementById("barChart").getContext("2d");
    if (barChart) {
        barChart.data.datasets[0].data = [
            data.pm25,
            data.pm10,
            data.nox,
            data.nh3,
            data.co2,
            data.so2,
            data.voc,
        ];
        barChart.update();
    } else {
        barChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["PM2.5", "PM10", "NOx", "NH3", "CO2", "SO2", "VOC"],
                datasets: [
                    {
                        label: "Pollutant Levels",
                        data: [
                            data.pm25,
                            data.pm10,
                            data.nox,
                            data.nh3,
                            data.co2,
                            data.so2,
                            data.voc,
                        ],
                        backgroundColor: "rgba(75, 192, 192, 0.5)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Pollutant Levels",
                    },
                },
            },
        });
    }
}

// Doughnut Chart: Pollutant Distribution
function createOrUpdateDoughnutChart(data) {
    const ctx = document.getElementById("doughnutChart").getContext("2d");
    if (doughnutChart) {
        doughnutChart.data.datasets[0].data = [
            data.pm25,
            data.pm10,
            data.nox,
            data.nh3,
            data.co2,
            data.so2,
            data.voc,
        ];
        doughnutChart.update();
    } else {
        doughnutChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["PM2.5", "PM10", "NOx", "NH3", "CO2", "SO2", "VOC"],
                datasets: [
                    {
                        data: [
                            data.pm25,
                            data.pm10,
                            data.nox,
                            data.nh3,
                            data.co2,
                            data.so2,
                            data.voc,
                        ],
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.5)",
                            "rgba(54, 162, 235, 0.5)",
                            "rgba(255, 206, 86, 0.5)",
                            "rgba(75, 192, 192, 0.5)",
                            "rgba(153, 102, 255, 0.5)",
                            "rgba(255, 159, 64, 0.5)",
                            "rgba(199, 199, 199, 0.5)",
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Pollutant Distribution",
                    },
                },
            },
        });
    }
}

// Toggle Sections
const homeButton = document.getElementById("homeButton");
const dataButton = document.getElementById("dataButton");
const homeSection = document.getElementById("home");
const dashboardSection = document.getElementById("dashboard");

homeButton.addEventListener("click", () => {
    homeSection.classList.add("active");
    dashboardSection.classList.remove("active");
});

dataButton.addEventListener("click", () => {
    homeSection.classList.remove("active");
    dashboardSection.classList.add("active");
    updateDashboard();
});

// Update Dashboard
async function updateDashboard() {
    const weatherData = await fetchWeatherData();
    const airQualityData = await fetchAirQualityData();

    if (weatherData && airQualityData) {
        const currentTimestamp = new Date().toLocaleTimeString();

        // Add new data to history
        temperatureHistory.push(weatherData.temperature);
        humidityHistory.push(weatherData.humidity);
        timestampsHistory.push(currentTimestamp);

        // Keep only the last 10 data points
        if (temperatureHistory.length > 10) {
            temperatureHistory.shift();
            humidityHistory.shift();
            timestampsHistory.shift();
        }

        const chartData = {
            timestamps: [...timestampsHistory],
            temperature: [...temperatureHistory],
            humidity: [...humidityHistory],
            pm25: airQualityData.pm25,
            pm10: airQualityData.pm10,
            nox: airQualityData.nox,
            nh3: airQualityData.nh3,
            co2: airQualityData.co2,
            so2: airQualityData.so2,
            voc: airQualityData.voc,
        };

        // Update charts
        createOrUpdateLineChart(chartData);
        createOrUpdateBarChart(chartData);
        createOrUpdateDoughnutChart(chartData);
    } else {
        console.error("Error: Failed to fetch data for the dashboard.");
    }
}

// Initialize and Auto-Refresh
updateDashboard();
setInterval(updateDashboard, 3600000); // Update every hour
