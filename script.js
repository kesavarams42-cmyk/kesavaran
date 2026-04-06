// Complete Weather App 

// API key constant
const API_KEY = 'your_api_key_here';

// Event listener for search by city
document.getElementById('search-button').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    fetchWeatherData(city);
});

// Event listener for location
document.getElementById('location-button').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeatherDataByCoords(position.coords.latitude, position.coords.longitude);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Function to fetch weather data
function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => displayCurrentWeather(data))
        .catch(error => handleError(error));
}

// Function to fetch weather data by coordinates
function fetchWeatherDataByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => displayCurrentWeather(data))
        .catch(error => handleError(error));
}

// Function to display current weather
function displayCurrentWeather(data) {
    const weatherContainer = document.getElementById('weather-data');
    weatherContainer.innerHTML = `<h2>${data.name}, ${data.sys.country}</h2>
                                  <p>${data.main.temp} °C</p>
                                  <p>${data.weather[0].description}</p>`;
    fetch5DayForecast(data.coord.lat, data.coord.lon);
}

// Function to fetch 5-day forecast
function fetch5DayForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => displayForecast(data))
        .catch(error => handleError(error));
}

// Function to display forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-data');
    forecastContainer.innerHTML = '';
    data.list.forEach(item => {
        forecastContainer.innerHTML += `<p>${new Date(item.dt * 1000).toLocaleDateString()} - ${item.main.temp} °C - ${item.weather[0].description}</p>`;
    });
}

// Error handling function
function handleError(error) {
    const errorContainer = document.getElementById('error-message');
    errorContainer.innerText = `Error: ${error.message}`;
}