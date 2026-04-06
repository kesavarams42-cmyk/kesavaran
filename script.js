const storageKey = "weather-now-api-key";
const iconMap = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Smoke: "🌫️",
  Haze: "🌫️",
  Dust: "🌪️",
  Fog: "🌫️",
  Sand: "🌪️",
  Ash: "🌋",
  Squall: "💨",
  Tornado: "🌪️",
};

const weatherForm = document.querySelector("#weather-form");
const apiKeyInput = document.querySelector("#api-key");
const cityInput = document.querySelector("#city-input");
const saveKeyButton = document.querySelector("#save-key-btn");
const locationButton = document.querySelector("#location-btn");
const forecastToggle = document.querySelector("#forecast-toggle");
const statusMessage = document.querySelector("#status-message");

const currentWeatherCard = document.querySelector("#current-weather");
const forecastSection = document.querySelector("#forecast-section");
const forecastGrid = document.querySelector("#forecast-grid");

const locationName = document.querySelector("#location-name");
const weatherTitle = document.querySelector("#weather-title");
const weatherIcon = document.querySelector("#weather-icon");
const temperature = document.querySelector("#temperature");
const conditionText = document.querySelector("#condition-text");
const humidity = document.querySelector("#humidity");
const feelsLike = document.querySelector("#feels-like");
const windSpeed = document.querySelector("#wind-speed");
const pressure = document.querySelector("#pressure");

apiKeyInput.value = localStorage.getItem(storageKey) || "";
syncForecastVisibility();

saveKeyButton.addEventListener("click", () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    updateStatus("Enter a valid API key before saving.", true);
    return;
  }

  localStorage.setItem(storageKey, apiKey);
  updateStatus("API key saved in this browser. You can now search weather data.");
});

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    updateStatus("Type a city name to search weather data.", true);
    return;
  }

  try {
    setLoadingState(`Looking up weather for ${city}...`);
    const apiKey = requireApiKey();
    const coordinates = await getCoordinatesByCity(city, apiKey);
    await loadWeatherBundle(coordinates.lat, coordinates.lon, apiKey, coordinates.name, coordinates.country);
  } catch (error) {
    handleError(error);
  }
});

locationButton.addEventListener("click", async () => {
  try {
    setLoadingState("Requesting your location...");
    const apiKey = requireApiKey();
    const position = await getCurrentPosition();
    await loadWeatherBundle(position.coords.latitude, position.coords.longitude, apiKey);
  } catch (error) {
    handleError(error);
  }
});

forecastToggle.addEventListener("change", () => {
  syncForecastVisibility();
});

function getApiKey() {
  return apiKeyInput.value.trim();
}

function requireApiKey() {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Add your OpenWeatherMap API key first.");
  }

  return apiKey;
}

function updateStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b3362d" : "";
}

function setLoadingState(message) {
  updateStatus(message);
  locationButton.disabled = true;
}

function clearLoadingState() {
  locationButton.disabled = false;
}

async function getCoordinatesByCity(city, apiKey) {
  const url = new URL("https://api.openweathermap.org/geo/1.0/direct");
  url.searchParams.set("q", city);
  url.searchParams.set("limit", "1");
  url.searchParams.set("appid", apiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("City lookup failed. Check your API key and try again.");
  }

  const results = await response.json();
  if (!results.length) {
    throw new Error(`No location found for "${city}".`);
  }

  return results[0];
}

async function loadWeatherBundle(lat, lon, apiKey, cityName, countryCode) {
  const currentUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  currentUrl.searchParams.set("lat", lat);
  currentUrl.searchParams.set("lon", lon);
  currentUrl.searchParams.set("appid", apiKey);
  currentUrl.searchParams.set("units", "metric");

  const forecastUrl = new URL("https://api.openweathermap.org/data/2.5/forecast");
  forecastUrl.searchParams.set("lat", lat);
  forecastUrl.searchParams.set("lon", lon);
  forecastUrl.searchParams.set("appid", apiKey);
  forecastUrl.searchParams.set("units", "metric");

  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
  ]);

  if (!currentResponse.ok || !forecastResponse.ok) {
    throw new Error("Weather request failed. Verify your API key and try again.");
  }

  const [currentData, forecastData] = await Promise.all([
    currentResponse.json(),
    forecastResponse.json(),
  ]);

  renderCurrentWeather(currentData, cityName, countryCode);
  renderForecast(forecastData);
  clearLoadingState();
  updateStatus(`Weather updated for ${currentData.name}, ${currentData.sys.country}.`);
}

function renderCurrentWeather(data, fallbackName, fallbackCountry) {
  const primaryWeather = data.weather[0];
  const displayName = fallbackName || data.name;
  const displayCountry = fallbackCountry || data.sys.country;

  locationName.textContent = `${displayName}, ${displayCountry}`;
  weatherTitle.textContent = primaryWeather.main;
  weatherIcon.textContent = pickIcon(primaryWeather.main);
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  conditionText.textContent = capitalize(primaryWeather.description);
  humidity.textContent = `${data.main.humidity}%`;
  feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
  windSpeed.textContent = `${Math.round(data.wind.speed)} m/s`;
  pressure.textContent = `${data.main.pressure} hPa`;

  currentWeatherCard.classList.remove("hidden");
}

function renderForecast(data) {
  forecastGrid.innerHTML = "";

  const dailyEntries = selectDailyForecasts(data.list).slice(0, 5);

  dailyEntries.forEach((entry) => {
    const card = document.createElement("article");
    const weather = entry.weather[0];
    const date = new Date(entry.dt_txt);
    card.className = "forecast-card";
    card.innerHTML = `
      <p class="day">${date.toLocaleDateString(undefined, { weekday: "short" })}</p>
      <p class="date">${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
      <p class="icon">${pickIcon(weather.main)}</p>
      <p class="temp">${Math.round(entry.main.temp)}°C</p>
      <p class="desc">${capitalize(weather.description)}</p>
    `;
    forecastGrid.appendChild(card);
  });

  syncForecastVisibility();
}

function selectDailyForecasts(entries) {
  const dayMap = new Map();

  entries.forEach((entry) => {
    const [day] = entry.dt_txt.split(" ");
    const current = dayMap.get(day);
    const isNoonReading = entry.dt_txt.includes("12:00:00");

    if (!current || isNoonReading) {
      dayMap.set(day, entry);
    }
  });

  return Array.from(dayMap.values());
}

function syncForecastVisibility() {
  const shouldShow = forecastToggle.checked && forecastGrid.children.length > 0;
  forecastSection.classList.toggle("hidden", !shouldShow);
}

function pickIcon(condition) {
  return iconMap[condition] || "🌤️";
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, () => {
      reject(new Error("Location access was denied or unavailable."));
    });
  });
}

function handleError(error) {
  clearLoadingState();
  updateStatus(error.message || "Something went wrong while loading weather data.", true);
}
