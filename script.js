const API_KEY = "YOUR_API_KEY_HERE"; // Replace with your OpenWeatherMap API key

async function fetchWeather(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) {
      alert(data.message);
      return;
    }

    displayWeather(data);
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

function displayWeather(data) {
  document.getElementById("city").innerText =
    `${data.name}, ${data.sys.country}`;
  document.getElementById("temp").innerText =
    `🌡 Temp: ${data.main.temp}°C`;
  document.getElementById("desc").innerText =
    `🌥 ${data.weather[0].description}`;
  document.getElementById("humidity").innerText =
    `💧 Humidity: ${data.main.humidity}%`;
  document.getElementById("wind").innerText =
    `💨 Wind: ${data.wind.speed} m/s`;

  document.getElementById("weather").classList.remove("hidden");
}

function getWeatherByCity() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Enter a city name");

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  fetchWeather(url);
}

function getWeatherByLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
    fetchWeather(url);
  }, () => {
    alert("Location access denied");
  });
}
