// Weather Backend - Based on friend's script.js
// Robust weather functionality with proper error handling
export const WeatherAPIKey = "ec86397cb0624a28b0b153411251410";
class WeatherBackend {
  constructor() {
    this.API_KEY = "ec86397cb0624a28b0b153411251410";
    this.currentTempC = null;
    this.showingCelsius = true;
    this.currentCity = "";

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadLastCity();
    this.setupAutoFeatures();
  }

  setupEventListeners() {
    // Desktop search
    const searchInput = document.getElementById("weatherSearch");
    const searchBtn = document.getElementById("searchBtn");
    const locationBtn = document.getElementById("locationBtn");
    const refreshBtn = document.getElementById("refreshBtn");

    // Mobile search
    const mobileSearchInput = document.getElementById("mobileWeatherSearch");
    const mobileSearchBtn = document.getElementById("mobileSearchBtn");
    const mobileLocationBtn = document.getElementById("mobileLocationBtn");
    const mobileRefreshBtn = document.getElementById("mobileRefreshBtn");

    // Desktop event listeners
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.performSearch(searchInput.value);
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        this.performSearch(searchInput.value);
      });
    }

    if (locationBtn) {
      locationBtn.addEventListener("click", () => {
        this.detectLocation();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.refreshWeather();
      });
    }

    // Mobile event listeners
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.performSearch(mobileSearchInput.value);
        }
      });
    }

    if (mobileSearchBtn) {
      mobileSearchBtn.addEventListener("click", () => {
        this.performSearch(mobileSearchInput.value);
      });
    }

    if (mobileLocationBtn) {
      mobileLocationBtn.addEventListener("click", () => {
        this.detectLocation();
      });
    }

    if (mobileRefreshBtn) {
      mobileRefreshBtn.addEventListener("click", () => {
        this.refreshWeather();
      });
    }
  }

  async performSearch(city) {
    if (!city || city.trim() === "") {
      this.showError("Masukkan nama kota terlebih dahulu");
      return;
    }

    try {
      this.showLoading();
      const weatherData = await this.getWeatherData(city.trim());
      this.updateWeatherDisplay(weatherData);
      this.addToHistory(city.trim());
      this.hideLoading();

      // Hide mobile menu if open
      const mobileMenu = document.getElementById("mobileMenu");
      if (mobileMenu) {
        mobileMenu.classList.add("hidden");
      }
    } catch (error) {
      console.error("Search error:", error);
      this.showError("Kota tidak ditemukan. Coba cari kota lain.");
    }
  }

  async getWeatherData(location) {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${this.API_KEY}&q=${location}&aqi=yes`
    );

    if (!response.ok) {
      throw new Error("Kota tidak ditemukan");
    }

    return await response.json();
  }

  updateWeatherDisplay(data) {
    // Store current data
    this.currentTempC = data.current.temp_c;
    this.currentCity = data.location.name;
    //Kirim sinyal ke anak (weather-data)
    const weatherEvent = new CustomEvent("weather-updated", {
      detail: {
        city: this.currentCity,
        data: data,
      },
    });
    window.dispatchEvent(weatherEvent);

    // Update temperature
    const tempElements = document.querySelectorAll(
      "#currentTemp, #currentTempMobile"
    );
    tempElements.forEach((el) => {
      if (el) el.textContent = `${Math.round(data.current.temp_c)}°`;
    });
    const text = document.getElementById("textRamalan");
    if (this.currentCity) {
      text.textContent = `Ramalan cuaca untuk ${this.currentCity}`;
    }

    // Update weather condition
    const conditionElements = document.querySelectorAll(
      "#weatherCondition, #weatherConditionMobile"
    );
    conditionElements.forEach((el) => {
      if (el) el.textContent = data.current.condition.text;
    });

    // Update feels like
    const feelsLikeElements = document.querySelectorAll(
      "#feelsLike, #feelsLikeMobile"
    );
    feelsLikeElements.forEach((el) => {
      if (el)
        el.textContent = `Terasa seperti: ${Math.round(
          data.current.feelslike_c
        )}°`;
    });

    // Update humidity
    const humidityElements = document.querySelectorAll(
      "#humidity, #humidityMobile"
    );
    humidityElements.forEach((el) => {
      if (el) el.textContent = `${data.current.humidity}%`;
    });

    // Update UV index
    const uvElements = document.querySelectorAll("#uvIndex, #uvIndexMobile");
    uvElements.forEach((el) => {
      if (el) el.textContent = data.current.uv;
    });

    // Update wind speed
    const windElements = document.querySelectorAll(
      "#windSpeed, #windSpeedMobile"
    );
    windElements.forEach((el) => {
      if (el) el.textContent = `${data.current.wind_kph} km/jam`;
    });

    // Update pressure
    const pressureElements = document.querySelectorAll("#pressure");
    pressureElements.forEach((el) => {
      if (el) el.textContent = `${data.current.pressure_mb} hPa`;
    });
 
    // Update visibility
    const visibilityElements = document.querySelectorAll("#visibility");
    console.log("📏 Visibilitas dari API:", data.current.vis_km);

    visibilityElements.forEach((el) => {
      if (el) el.textContent = `${data.current.vis_km} km`;
    });
    // Update Air Quality Index (AQI)
    const airQualityElements = document.querySelectorAll("#airQuality");
    if (data.current.air_quality && data.current.air_quality["pm2_5"]) {
      const pm25 = Math.round(data.current.air_quality["pm2_5"]);
      const aqiLabel = this.getAQILevel(pm25);

      airQualityElements.forEach((el) => {
        if (el) {
          el.innerHTML = `<p>${aqiLabel}<br>(${pm25} µg/m³)</p>`;
          el.className = `text-mode aqi-${aqiLabel.toLowerCase().replace(/\s/g, '-')}`;
        }
      });
    } else {
      airQualityElements.forEach((el) => {
        if (el) el.textContent = "Tidak tersedia";
      });
    }

    // Update location name in header
    const locationElements = document.querySelectorAll(
      "p.text-mode.text-sm.opacity-80"
    );
    locationElements.forEach((el) => {
      if (el) el.textContent = data.location.name;
    });

    // Update background based on temperature
    this.updateBackground(data.current.temp_c);

    // Check for extreme weather
    this.checkExtremeWeather(data.current.temp_c);

    // Save to localStorage
    localStorage.setItem("lastCity", data.location.name);
    // Kirim event global agar file lain bisa tahu ada data baru
    window.dispatchEvent(
      new CustomEvent("weather-updated", {
        detail: { city: data.location.name, data },
      })
    );
  }

  updateBackground(temperature) {
    const body = document.body;
    const wheaterCondition = document.getElementById("weatherCondition");
    const mobileWheaterCondition = document.getElementById(
      "weatherConditionMobile"
    );
    const feelsLike = document.getElementById("feelsLike");
    const mobileFeelsLike = document.getElementById("feelsLikeMobile");

    // Remove existing temperature classes
    body.classList.remove("temp-hot", "temp-warm", "temp-cool", "temp-cold");

    if (temperature >= 35) {
      body.classList.add("temp-hot");
    } else if (temperature >= 30) {
      body.classList.add("temp-warm");
    } else if (temperature >= 24) {
      body.classList.add("temp-cool");
    } else {
      body.classList.add("temp-cold");
    }
  }
  getAQILevel(pm25) {
    if (pm25 <= 12) return "Baik";
    if (pm25 <= 35) return "Sedang";
    if (pm25 <= 55) return "Tidak Sehat bagi Kelompok Sensitif";
    if (pm25 <= 150) return "Tidak Sehat";
    if (pm25 <= 250) return "Sangat Tidak Sehat";
    return "Berbahaya";
  }

  checkExtremeWeather(temp) {
    if (temp >= 38) {
      document.body.classList.add("warning");
      setTimeout(() => document.body.classList.remove("warning"), 600);
      this.showExtremeWeatherAlert();
    }
  }

  showExtremeWeatherAlert() {
    const alertDiv = document.createElement("div");
    alertDiv.className =
      "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-mode px-6 py-4 rounded-lg shadow-lg animate-pulse";
    alertDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
                </svg>
                <span class="font-bold">PERINGATAN SUHU EKSTREM!</span>
            </div>
            <p class="text-sm mt-1">Tetap terhidrasi dan hindari aktivitas di luar ruangan!</p>
        `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 5000);
  }

  async detectLocation() {
    if (!navigator.geolocation) {
      this.showError("Geolokasi tidak didukung oleh browser");
      return;
    }

    try {
      this.showLoading();

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const accuracy = position.coords.accuracy;
            console.log(
              "Location detected:",
              latitude,
              longitude,
              "Accuracy:",
              accuracy,
              "meters"
            );

            // Use GPS location even if accuracy is not perfect
            // Weather API can handle approximate coordinates
            const weatherData = await this.getWeatherData(
              `${latitude},${longitude}`
            );
            this.updateWeatherDisplay(weatherData);
            this.addToHistory(weatherData.location.name);
            this.hideLoading();
          } catch (error) {
            console.error("Weather API error:", error);
            this.hideLoading();
            this.showError(
              "Gagal mengambil data cuaca untuk lokasi Anda. Silakan cari kota secara manual."
            );
          }
        },
        async (error) => {
          console.warn("Geolocation failed:", error);
          this.hideLoading();
          this.showError(
            "Gagal mendeteksi lokasi. Silakan cari kota secara manual."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    } catch (error) {
      console.error("Location detection error:", error);
      this.hideLoading();
      this.showError("Gagal mendeteksi lokasi");
    }
  }

  async refreshWeather() {
    if (this.currentCity) {
      try {
        this.showLoading();
        const weatherData = await this.getWeatherData(this.currentCity);
        this.updateWeatherDisplay(weatherData);
        this.hideLoading();
      } catch (error) {
        console.error("Refresh error:", error);
        this.showError("Gagal memperbarui data cuaca");
      }
    } else {
      this.showError("Tidak ada kota yang dipilih untuk di-refresh");
    }
  }

  addToHistory(city) {
    let history = JSON.parse(
      localStorage.getItem("weatherSearchHistory") || "[]"
    );
    history = history.filter((item) => item !== city);
    history.unshift(city);
    history = history.slice(0, 10);
    localStorage.setItem("weatherSearchHistory", JSON.stringify(history));
  }

  loadLastCity() {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
      this.performSearch(lastCity);
    }
  }

  setupAutoFeatures() {
    // Auto night mode
    const jam = new Date().getHours();
    const root = document.documentElement;
    if (jam >= 18 || jam < 8) {
      root.classList.add("dark");
    }

    // Disable auto-update to prevent conflicts
    // Auto-update can cause weather data to change unexpectedly
    // Users can manually refresh if needed
  }

  showLoading() {
    console.log("Loading weather data...");
    // Add visual loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "weatherLoading";
    loadingDiv.className =
      "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-mode px-4 py-2 rounded-lg shadow-lg";
    loadingDiv.innerHTML = "🔄 Memuat data cuaca...";
    document.body.appendChild(loadingDiv);
  }

  hideLoading() {
    const loadingDiv = document.getElementById("weatherLoading");
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  showError(message) {
    console.error(message);
    this.hideLoading();

    // Show error notification instead of alert
    const errorDiv = document.createElement("div");
    errorDiv.className =
      "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-mode px-6 py-4 rounded-lg shadow-lg";
    errorDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>${message}</span>
            </div>
        `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  // Temperature classification
  // klasifikasiSuhu(temp) {
  //     if (temp >= 35) return { label: "Sangat Panas" };
  //     if (temp >= 30) return { label: "Panas" };
  //     if (temp >= 25) return { label: "Hangat" };
  //     if (temp >= 20) return { label: "Sejuk" };
  //     return { label: "Dingin" };
  // }
}

// Initialize weather backend when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.weatherBackend = new WeatherBackend();

  setInterval(() => {
    if (window.weatherBackend && window.weatherBackend.currentCity) {
      console.log(
        `Auto-refreshing weather data dari kota ${window.weatherBackend.currentCity}`
      );
      window.weatherBackend.refreshWeather();
    }
  }, 30000);
});
