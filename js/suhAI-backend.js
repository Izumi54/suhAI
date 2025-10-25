// Weather Backend - Based on friend's script.js
// Robust weather functionality with proper error handling
export const WeatherAPIKey = "ec86397cb0624a28b0b153411251410";
class WeatherBackend {
  constructor() {
    this.API_KEY = "ec86397cb0624a28b0b153411251410";
    this.currentTempC = null;
    this.showingCelsius = true;
    this.currentCity = "";
    this.map = null;
    this.marker = null;
    this.layers={
      temp:null,
      humadity:null,
      uv:null,
      wind:null
    };
    this.activeLayers = new Set();

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadLastCity();
    this.setupAutoFeatures();
    // tambah
    this.initializeMap();
    this.initializeMobileMap();
    this.cleanupHeatmapCanvas();
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

    //layer cuaca map
const layerTemp = document.getElementById("layerTemp");
const layerHumidity = document.getElementById("layerHumidity");
const layerUV = document.getElementById("layerUV");
const layerWind = document.getElementById("layerWind");

if (layerTemp) layerTemp.addEventListener("change", (e) => this.toggleLayer("temp", e.target.checked));
if (layerHumidity) layerHumidity.addEventListener("change", (e) => this.toggleLayer("humidity", e.target.checked));
if (layerUV) layerUV.addEventListener("change", (e) => this.toggleLayer("uv", e.target.checked));
if (layerWind) layerWind.addEventListener("change", (e) => this.toggleLayer("wind", e.target.checked));

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
      `https://api.weatherapi.com/v1/forecast.json?key=${this.API_KEY}&q=${location}&aqi=yes`
    );

    if (!response.ok) {
      throw new Error("Kota tidak ditemukan");
    }

    return await response.json();
  }
  
  updateWeatherDisplay(data) {
    // map checklist
    window.weatherBackend.currentCityData = data;

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
    console.log("Visibilitas dari API:", data.current.vis_km);

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
    // new weather layers
    for (const type of this.activeLayers) {
      this.updateWeatherLayer(type, data)
    }

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
    // map section
    // Update posisi peta sesuai kota
if (this.map && data.location) {
  const { lat, lon, name } = data.location;

  this.map.setView([lat, lon], 12);

  // Ganti marker-nya
  if (this.marker) {
    this.marker.setLatLng([lat, lon]);
    this.marker.setPopupContent(`${name}`);
  } else {
    this.marker = L.marker([lat, lon]).addTo(this.map)
      .bindPopup(`${name}`)
      .openPopup();
  }

  // Update text di overlay
  const nameEl = document.getElementById("mapLocationName");
  const coordEl = document.getElementById("mapCoordinates");
  if (nameEl && coordEl) {
    nameEl.textContent = name;
    coordEl.textContent = `Koordinat: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}
if (this.mapMobile && data.location) {
  const { lat, lon, name } = data.location;
  this.mapMobile.setView([lat, lon], 12);

  if (this.markerMobile) {
    this.markerMobile.setLatLng([lat, lon]);
    this.markerMobile.setPopupContent(`${name}`);
  } else {
    this.markerMobile = L.marker([lat, lon]).addTo(this.mapMobile)
      .bindPopup(`${name}`)
      .openPopup();
  }

  const nameEl = document.getElementById("mapLocationNameMobile");
  const coordEl = document.getElementById("mapCoordinatesMobile");
  if (nameEl && coordEl) {
    nameEl.textContent = name;
    coordEl.textContent = `Koordinat: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

  }
cleanupHeatmapCanvas() {
  const heatmapCanvases = document.querySelectorAll(".leaflet-heatmap-layer, canvas.leaflet-heatmap-layer");
  heatmapCanvases.forEach((c) => {
    c.style.pointerEvents = "none";
    c.style.touchAction = "none";
  });
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
    this.showLoading(); // tampilkan loading indicator di UI
  
    try {
      // --- 1) Coba ambil lokasi dari Woosmap dulu ---
      const WOOSMAP_KEY = "woos-24c0e4c3-0033-337f-b262-2fe39293c775"; // ganti dengan key-mu
      const woosmapURL = `https://api.woosmap.com/geolocation/position?key=${WOOSMAP_KEY}`;
  
      // Siapkan timeout agar fetch tidak menggantung
      const controller = new AbortController();   
      const timeoutMs = 3000; // batas waktu 3 detik
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
      const response = await fetch(woosmapURL, { signal: controller.signal });
      clearTimeout(timeoutId);
  
      if (!response.ok) throw new Error(`Woosmap HTTP ${response.status}`);
  
      // Ambil data JSON dari response
      const data = await response.json();
  
      // Validasi hasil lokasi Woosmap
      if (data && data.location && typeof data.location.lat === "number" && typeof data.location.lng === "number") {
        const latitude = data.location.lat;
        const longitude = data.location.lng;
        console.log("Lokasi dari Woosmap:", latitude, longitude);
  
        const weatherData = await this.getWeatherData(`${latitude},${longitude}`);
        this.updateWeatherDisplay(weatherData);
        this.addToHistory(weatherData.location.name);
        this.hideLoading();
        return;
      } else {
        throw new Error("Data lokasi Woosmap tidak valid");
      }
    } catch (err) {
      // --- Kalau Woosmap gagal, jalankan fallback ke geolocation bawaan browser ---
      console.warn("Woosmap gagal, fallback ke geolocation:", err.message);
  
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const latitude = pos.coords.latitude;
              const longitude = pos.coords.longitude;
              console.log("Lokasi fallback dari browser:", latitude, longitude);
  
              const weatherData = await this.getWeatherData(`${latitude},${longitude}`);
              this.updateWeatherDisplay(weatherData);
              this.addToHistory(weatherData.location.name);
            } catch (error) {
              console.error("Error ambil weather data fallback:", error);
              this.showError("Gagal mengambil data cuaca fallback.");
            } finally {
              this.hideLoading();
            }
          },
          (error) => {
            console.error("Fallback geolocation gagal:", error);
            this.showError("Tidak bisa mendeteksi lokasi Anda.");
            this.hideLoading();
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        this.showError("Browser tidak mendukung geolokasi.");
        this.hideLoading();
      }
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
  // Map initialization
  initializeMap() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) {
    console.warn("Elemen #map tidak ditemukan, lewati inisialisasi peta.");
    return;
  }

  if (this.map) return; // cegah duplikasi

  const config = {
    minZoom: 1,
    maxZoom: 18,
  };

  // Lokasi awal Jepara
  const lat = -6.5944;
  const lng = 110.6717;
  const zoom = 12;

  this.map = L.map("map", config).setView([lat, lng], zoom);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(this.map);

  // Tambahkan marker awal
  this.marker = L.marker([lat, lng]).addTo(this.map)
    .bindPopup("Jepara (Lokasi Awal)")
    .openPopup();

  // Event tombol zoom
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");
  if (zoomIn && zoomOut) {
    zoomIn.addEventListener("click", () => this.map.zoomIn());
    zoomOut.addEventListener("click", () => this.map.zoomOut());
  }

  console.log("Map berhasil diinisialisasi!");
}
initializeMobileMap() {
  const mapContainer = document.getElementById("mapMobile");
  if (!mapContainer) {
    console.warn("Elemen #mapMobile tidak ditemukan");
    return;
  }

  if (this.mapMobile) return; // biar gak duplikat

  const config = { minZoom: 7, maxZoom: 18 };
  const lat = -6.5944, lng = 110.6717;

  this.mapMobile = L.map("mapMobile", config).setView([lat, lng], 12);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  }).addTo(this.mapMobile);

  this.markerMobile = L.marker([lat, lng]).addTo(this.mapMobile)
    .bindPopup("📍 Jepara (Awal)")
    .openPopup();

  // Tombol zoom
  const zoomIn = document.getElementById("zoomInMobile");
  const zoomOut = document.getElementById("zoomOutMobile");
  if (zoomIn && zoomOut) {
    zoomIn.addEventListener("click", () => this.mapMobile.zoomIn());
    zoomOut.addEventListener("click", () => this.mapMobile.zoomOut());
  }

  console.log("📱 Mobile map siap!");
}
toggleLayer(type, isActive) {
  if (!this.map) return;
  if (isActive) {
    this.activeLayers.add(type);
    console.log(`Mengaktifkan layer: ${type}`);
    if (window.weatherBackend && window.weatherBackend.currentCityData) {
      this.updateWeatherLayer(type, window.weatherBackend.currentCityData);
    }
  } else {
    this.activeLayers.delete(type);
    console.log(`Menonaktifkan layer: ${type}`);
    if (this.layers[type]) {
      this.map.removeLayer(this.layers[type]);
      this.layers[type] = null;
    }
  }
}

createWeatherLayer(type) {
  // Contoh titik dummy sekitar kota aktif
  const { lat = -6.5944, lon = 110.6717 } = this.map.getCenter();
  const points = [];

  for (let i = 0; i < 20; i++) {
    const offsetLat = lat + (Math.random() - 0.5) * 0.3;
    const offsetLon = lon + (Math.random() - 0.5) * 0.3;

    let value = 0;
    switch (type) {
      case "temp": value = Math.random() * 10 + 25; break;
      case "humidity": value = Math.random() * 40 + 40; break;
      case "uv": value = Math.random() * 10; break;
      case "wind": value = Math.random() * 20; break;
    }

    points.push([offsetLat, offsetLon, value / 10]);
  }

  // Gunakan Leaflet.heat
 this.layers[type] = L.heatLayer(points, {
  radius: 25,
  blur: 20,
  maxZoom: 12,
  gradient: this.getLayerColor(type),
}).addTo(this.map);

// Perbaikan interaksi
const canvas = this.layers[type]._canvas;
if (canvas) {
  canvas.style.pointerEvents = "none"; // penting banget!
}

}


updateWeatherLayer(type, data) {
  if (!this.map) return;

  // Hapus layer lama biar gak numpuk
  if (this.layers[type]) {
    this.map.removeLayer(this.layers[type]);
    this.layers[type] = null;
  }

  const { lat, lon } = data.location;
  const baseValue = data.current;
  const points = [];

  // Buat titik-titik sekitar kota dengan variasi lembut
  for (let i = 0; i < 60; i++) {
    const offsetLat = lat + (Math.random() - 0.5) * 0.25; // jangkauan lebih luas
    const offsetLon = lon + (Math.random() - 0.5) * 0.25;

    let value = 0;
    switch (type) {
      case "temp": value = baseValue.temp_c; break;
      case "humidity": value = baseValue.humidity; break;
      case "uv": value = baseValue.uv * 10; break;
      case "wind": value = baseValue.wind_kph; break;
    }

    // Sedikit variasi untuk gradasi halus
    const smoothValue = value / 100 + Math.random() * 0.02;
    points.push([offsetLat, offsetLon, smoothValue]);
  }

  // Gradasi halus per layer
  const gradient = this.getLayerColor(type);

  // Heatmap baru dengan radius besar dan blur lembut
  this.layers[type] = L.heatLayer(points, {
    radius: 55,      // lebih besar (sebaran lebih luas)
    blur: 35,        // gradasi lembut
    maxZoom: 12,
    gradient: gradient,
    minOpacity: 0.4, // biar gak terlalu tebal
  }).addTo(this.map);

  // Perbaikan interaksi
 const canvas = this.layers[type]._canvas;
if (canvas) {
  canvas.style.pointerEvents = "none"; // cegah blok scroll
  canvas.style.touchAction = "none";   // biar di HP bisa scroll halus
}
  // Aktifkan interaksi map
  this.map.dragging.enable();
  this.map.scrollWheelZoom.enable();
  this.map.doubleClickZoom.enable();
  this.map.touchZoom.enable();
}



getLayerColor(type) {
  switch (type) {
    case "temp":
      return {
        0.0: "#00f5ff",   // biru muda
        0.3: "#00ff88",   // hijau muda
        0.5: "#ffff00",   // kuning
        0.7: "#ff8800",   // oranye
        1.0: "#ff0000"    // merah
      };
    case "humidity":
      return {
        0.0: "#d0f0ff",
        0.4: "#4fc3f7",
        0.7: "#1976d2",
        1.0: "#0d47a1"
      };
    case "uv":
      return {
        0.0: "#fff59d",
        0.4: "#ffb300",
        0.7: "#f57c00",
        1.0: "#6a1b9a"
      };
    case "wind":
      return {
        0.0: "#a5d6a7",
        0.4: "#66bb6a",
        0.7: "#43a047",
        1.0: "#1b5e20"
      };
    default:
      return {
        0.0: "#00e5ff",
        1.0: "#2979ff"
      };
  }
}


  showLoading() {
    console.log("Loading weather data...");
    // Add visual loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "weatherLoading";
    loadingDiv.className =
      "fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-mode px-4 py-2 rounded-lg shadow-lg";
    loadingDiv.innerHTML = "Memuat data cuaca...";
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

setInterval(async () => {
  if (window.weatherBackend?.currentCity) {
    console.log(`Memperbarui heatmap ${window.weatherBackend.currentCity}`);
    await window.weatherBackend.refreshWeather();
    for (const type of window.weatherBackend.activeLayers) {
      window.weatherBackend.updateWeatherLayer(type, window.weatherBackend.currentCityData);
    }
  }
},  60000); // setiap 5 menit

});
