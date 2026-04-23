const cityInput = document.getElementById("searchCity");
const mobileCityInput = document.getElementById("mobileSearchCity");

const backgroundsList = [
  "day1.jpg", "day2.jpg", "day3.jpg", "day4.jpg", "day5.jpg",
  "cloudy1.jpg", "cloudy2.jpg", "cloudy3.jpg", "cloudy4.jpg", "cloudy5.jpg",
  "rainy1.jpg", "rainy2.jpg", "rainy3.jpg", "rainy4.jpg", "rainy5.jpg",
  "night1.jpg", "night2.jpg", "night3.jpg", "night4.jpg", "night5.jpg"
];

function setRandomBackground() {
  const randomBackground = backgroundsList[Math.floor(Math.random() * backgroundsList.length)];
  document.body.style.backgroundImage = `url('media/${randomBackground}')`;
}

setRandomBackground();

async function getWeather(city) {
  const apiKey = "7e9d3d6449f07719ae9a0999caded756";
  const unit = "metric";
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;

  await fetchWeatherData(apiUrl, forecastUrl);
}

async function getWeatherByCoords(lat, lon) {
  const apiKey = "7e9d3d6449f07719ae9a0999caded756";
  const unit = "metric";
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;

  await fetchWeatherData(apiUrl, forecastUrl);
}

async function fetchWeatherData(apiUrl, forecastUrl) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.cod !== 200) {
      showError("City Not Found");
      return;
    }

    updateMainWeather(data);

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();
    updateForecast(forecastData);

  } catch (error) {
    console.error('Error fetching data:', error);
    showError("Something went wrong");
  }
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    loader();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        getWeather("London"); // Fallback city
      }
    );
  } else {
    console.warn("Geolocation not supported");
    getWeather("London"); // Fallback city
  }
}

function updateMainWeather(data) {
  document.getElementById("locationName").innerHTML = data.name;
  document.getElementById("temperatureValue").innerHTML = `${Math.round(data.main.temp)}°`;
  document.getElementById("weatherType").innerHTML = data.weather[0].description;
  
  document.getElementById("realFeelAdditionalValue").innerHTML = `${Math.round(data.main.feels_like)}°C`;
  document.getElementById("humidityAdditionalValue").innerHTML = `${data.main.humidity}%`;
  document.getElementById("maxTemperatureAdditionalValue").innerHTML = `${Math.round(data.main.temp_max)}°C`;
  document.getElementById("minTemperatureAdditionalValue").innerHTML = `${Math.round(data.main.temp_min)}°C`;
  document.getElementById("windSpeedAdditionalValue").innerHTML = `${data.wind.speed} km/h`;
  document.getElementById("windDirectionAdditionalValue").innerHTML = `${data.wind.deg}°`;
  document.getElementById("visibilityAdditionalValue").innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;
  document.getElementById("pressureAdditionalValue").innerHTML = `${data.main.pressure} hPa`;
  
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  document.getElementById("sunriseAdditionalValue").innerHTML = sunrise;
  document.getElementById("sunsetAdditionalValue").innerHTML = sunset;
  document.getElementById("airQualityValue").innerHTML = "Good"; // Placeholder as OpenWeather needs a different API for AQI
}

function updateForecast(data) {
  const container = document.getElementById('forecast-container');
  container.innerHTML = '';

  const dailyForecasts = {};
  data.list.forEach(entry => {
    const date = new Date(entry.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date: date,
        icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`,
        maxTemp: entry.main.temp_max,
        minTemp: entry.main.temp_min,
        weatherType: entry.weather[0].main
      };
    } else {
      dailyForecasts[date].maxTemp = Math.max(dailyForecasts[date].maxTemp, entry.main.temp_max);
      dailyForecasts[date].minTemp = Math.min(dailyForecasts[date].minTemp, entry.main.temp_min);
    }
  });

  Object.values(dailyForecasts).slice(0, 6).forEach(day => {
    const card = document.createElement('div');
    card.classList.add('daily-forecast-card');
    card.innerHTML = `
      <p class="daily-forecast-date">${day.date}</p>
      <img class="forecast-icon" src="${day.icon}" alt="${day.weatherType}">
      <div class="max-min-temperature-daily-forecast">
        <span class="max-daily-forecast">${Math.round(day.maxTemp)}°</span>
        <span class="min-daily-forecast">${Math.round(day.minTemp)}°</span>
      </div>
      <p class="weather-type-daily-forecast">${day.weatherType}</p>
    `;
    container.appendChild(card);
  });
}

function loader() {
  const ids = ["locationName", "temperatureValue", "weatherType"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = '<img src="icons/loader.gif" class="loader-img" style="width:30px; height:30px;">';
  });
}

function showError(message) {
  document.getElementById("locationName").innerHTML = message;
  document.getElementById("temperatureValue").innerHTML = "";
  document.getElementById("weatherType").innerHTML = "";
}

cityInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter" && cityInput.value.trim() !== "") {
    loader();
    getWeather(cityInput.value.trim());
  }
});

if (mobileCityInput) {
  mobileCityInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter" && mobileCityInput.value.trim() !== "") {
      loader();
      getWeather(mobileCityInput.value.trim());
    }
  });
}

document.getElementById("resetBtn").addEventListener("click", (e) => {
  e.preventDefault();
  cityInput.value = "";
  if (mobileCityInput) mobileCityInput.value = "";
  setRandomBackground();
  location.reload();
});

// Dropdown Logic
const settingsBtn = document.getElementById("settingsBtn");
const settingsDropdown = document.getElementById("settingsDropdown");

settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  settingsDropdown.classList.toggle("show");
});

window.addEventListener("click", (e) => {
  if (!settingsDropdown.contains(e.target) && e.target !== settingsBtn) {
    settingsDropdown.classList.remove("show");
  }
});

window.addEventListener("load", getWeatherByLocation);
