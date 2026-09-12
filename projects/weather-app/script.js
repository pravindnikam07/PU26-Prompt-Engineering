// ==========================================
// OPENWEATHER API CONFIGURATION
// ==========================================

const API_KEY = "292653ddfbca171ded50761d263af16c"; // "bf7d2eb7c032bbaa94d76e0774d5e714";

const API_URL = "https://api.openweathermap.org/data/2.5/weather";

// ==========================================
// GET HTML ELEMENTS
// ==========================================

const cityInput = document.getElementById("cityInput");

const searchButton = document.getElementById("searchButton");

const message = document.getElementById("message");

const weatherContainer = document.getElementById("weatherContainer");

// ==========================================
// SEARCH BUTTON
// ==========================================

searchButton.addEventListener("click", getWeather);

// ==========================================
// ENTER KEY
// ==========================================

cityInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});

// ==========================================
// GET WEATHER
// ==========================================

async function getWeather() {
  const city = cityInput.value.trim();

  // Check city

  if (city === "") {
    showMessage("Please enter a city name.");

    return;
  }

  // Show loading

  showMessage("Loading weather data...");

  weatherContainer.classList.add("hidden");

  try {
    // ==================================
    // CREATE API URL
    // ==================================

    const url =
      `${API_URL}?q=${encodeURIComponent(city)}` +
      `&appid=${API_KEY}` +
      `&units=metric`;

    // ==================================
    // CALL WEATHER API
    // ==================================

    const response = await fetch(url);

    // ==================================
    // HANDLE ERROR
    // ==================================

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key.");
      }

      if (response.status === 404) {
        throw new Error("City not found.");
      }

      throw new Error("Unable to fetch weather data.");
    }

    // ==================================
    // CONVERT RESPONSE TO JSON
    // ==================================

    const data = await response.json();

    // ==================================
    // DISPLAY DATA
    // ==================================

    displayWeather(data);

    message.textContent = "";

    weatherContainer.classList.remove("hidden");
  } catch (error) {
    showMessage(error.message);
  }
}

// ==========================================
// DISPLAY WEATHER
// ==========================================

function displayWeather(data) {
  // City

  document.getElementById("cityName").textContent = data.name;

  // Country

  document.getElementById("countryName").textContent = data.sys.country;

  // Temperature

  document.getElementById("temperature").textContent = Math.round(
    data.main.temp
  );

  // Feels Like

  document.getElementById("feelsLike").textContent = Math.round(
    data.main.feels_like
  );

  // Weather Description

  document.getElementById("weatherDescription").textContent = capitalize(
    data.weather[0].description
  );

  // Weather Icon

  document.getElementById("weatherIcon").src =
    `https://openweathermap.org/img/wn/` + `${data.weather[0].icon}@2x.png`;

  // Humidity

  document.getElementById("humidity").textContent = data.main.humidity;

  // Pressure

  document.getElementById("pressure").textContent = data.main.pressure;

  // Wind

  document.getElementById("windSpeed").textContent = Math.round(
    data.wind.speed * 3.6
  );

  // Minimum Temperature

  document.getElementById("minTemp").textContent = Math.round(
    data.main.temp_min
  );

  // Maximum Temperature

  document.getElementById("maxTemp").textContent = Math.round(
    data.main.temp_max
  );

  // Visibility

  document.getElementById("visibility").textContent = (
    data.visibility / 1000
  ).toFixed(1);

  // Sunrise

  document.getElementById("sunrise").textContent = convertTime(
    data.sys.sunrise,
    data.timezone
  );

  // Sunset

  document.getElementById("sunset").textContent = convertTime(
    data.sys.sunset,
    data.timezone
  );
}

// ==========================================
// CONVERT UNIX TIME
// ==========================================

function convertTime(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);

  let hours = date.getUTCHours();

  let minutes = date.getUTCMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  hours = hours || 12;

  minutes = minutes.toString().padStart(2, "0");

  return `${hours}:${minutes} ${ampm}`;
}

// ==========================================
// CAPITALIZE TEXT
// ==========================================

function capitalize(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text) {
  message.textContent = text;
}
