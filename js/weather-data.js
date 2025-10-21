// Weather Data Management
const WeatherData = {
    current: {
        temperature: 34,
        condition: "Cerah Berawan",
        feelsLike: 39,
        humidity: 75,
        uvIndex: 8,
        windSpeed: 12,
        location: "Jepara",
        pressure: 1013,
        visibility: 10,
        airQuality: "Baik"
    },
    forecast: [
        { day: "Hari Ini", date: "16 Okt", high: 34, low: 27, condition: "sunny", icon: "☀️", precipitation: 0, wind: 12 },
        { day: "Besok", date: "17 Okt", high: 32, low: 26, condition: "partly-cloudy", icon: "⛅", precipitation: 10, wind: 15 },
        { day: "Sabtu", date: "18 Okt", high: 31, low: 25, condition: "rainy", icon: "🌧️", precipitation: 80, wind: 20 },
        { day: "Minggu", date: "19 Okt", high: 31, low: 25, condition: "stormy", icon: "⛈️", precipitation: 90, wind: 25 },
        { day: "Senin", date: "20 Okt", high: 32, low: 26, condition: "partly-cloudy", icon: "⛅", precipitation: 20, wind: 18 },
        { day: "Selasa", date: "21 Okt", high: 35, low: 29, condition: "sunny", icon: "☀️", precipitation: 0, wind: 10 },
        { day: "Rabu", date: "22 Okt", high: 34, low: 27, condition: "sunny", icon: "☀️", precipitation: 5, wind: 14 }
    ],
    recommendations: [
        {
            category: "Hidrasi & Nutrisi",
            icon: "💧",
            priority: "high",
            items: [
                "Minum air putih minimal 1 gelas setiap jam",
                "Konsumsi buah-buahan kaya air seperti semangka atau melon",
                "Hindari minuman berkafein yang dapat menyebabkan dehidrasi",
                "Konsumsi makanan ringan dan mudah dicerna"
            ]
        },
        {
            category: "Aktifitas Luar Ruangan",
            icon: "☀️",
            priority: "high",
            items: [
                "Hindari aktivitas fisik berat antara pukul 11:00 - 15.00",
                "Jika harus keluar, gunakan topi lebar dan cari tempat teduh",
                "Aplikasikan tabir surya SPF 30+ setiap 2 jam",
                "Kenakan pakaian longgar dan berwarna terang"
            ]
        },
        {
            category: "Pakaian & Rumah",
            icon: "👚",
            priority: "medium",
            items: [
                "Gunakan pakaian berbahan katun yang menyerap keringat",
                "Pastikan ventilasi rumah cukup dan gunakan kipas angin",
                "Tutup jendela dan tirai pada siang hari untuk mengurangi panas",
                "Gunakan kipas angin atau AC jika tersedia"
            ]
        },
        {
            category: "Kesehatan & Keselamatan",
            icon: "🏥",
            priority: "high",
            items: [
                "Waspada gejala heat stroke: pusing, mual, lemas",
                "Istirahat di tempat teduh setiap 30 menit",
                "Hindari alkohol dan makanan berat",
                "Segera cari pertolongan jika merasa tidak enak badan"
            ]
        }
    ],
    heatmap: {
        locations: [
            { name: "Pusat Kota", temp: 38, lat: -6.5944, lng: 110.6717 },
            { name: "Pantai Kartini", temp: 32, lat: -6.6000, lng: 110.6500 },
            { name: "Bandara", temp: 35, lat: -6.5800, lng: 110.6800 },
            { name: "Pelabuhan", temp: 30, lat: -6.5900, lng: 110.6600 },
            { name: "Pasar", temp: 36, lat: -6.5950, lng: 110.6720 },
            { name: "Sekolah", temp: 33, lat: -6.5920, lng: 110.6700 }
        ]
    }
};

// Navigation State Management
const Navigation = {
    currentSection: 'dashboard',
    sections: ['dashboard', 'forecast', 'recommendations', 'heatmap'],
    
    init() {
        this.setupEventListeners();
        this.updateActiveNav();
    },
    
    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    },
    
    navigateToSection(section) {
        this.currentSection = section;
        const targetElement = document.getElementById(section + 'Section');
        
        if (targetElement) {
            // Calculate offset for sticky header
            const headerHeight = 100;
            const elementPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
            
            this.updateActiveNav();
        }
    },
    
    updateActiveNav() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('nav-active');
        });
        
        const activeBtn = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (activeBtn) {
            activeBtn.classList.add('nav-active');
        }
    }
};

// UI Components
const UIComponents = {
    // Create weather card
    createWeatherCard(data, type = 'default') {
        const card = document.createElement('div');
        card.className = `glassmorphism-card rounded-2xl p-4 card-hover-enhanced interactive-element ${type}`;
        
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="text-2xl">${data.icon}</div>
                    <div>
                        <div class="text-white text-sm font-semibold">${data.day}</div>
                        <div class="text-white text-xs opacity-80">${data.date}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-white text-lg font-bold">${data.high}°</div>
                    <div class="text-white text-sm opacity-80">${data.low}°</div>
                </div>
            </div>
        `;
        
        return card;
    },
    
    // Create recommendation card
    createRecommendationCard(data) {
        const priorityColors = {
            high: 'border-red-400',
            medium: 'border-yellow-400',
            low: 'border-green-400'
        };
        
        const card = document.createElement('div');
        card.className = `glassmorphism-card rounded-2xl p-4 card-hover-enhanced interactive-element border-l-4 ${priorityColors[data.priority]}`;
        
        const itemsHtml = data.items.map(item => 
            `<div class="flex items-start space-x-2 mb-2">
                <span class="text-green-400 text-sm mt-0.5">✓</span>
                <span class="text-white text-sm">${item}</span>
            </div>`
        ).join('');
        
        card.innerHTML = `
            <div class="flex items-center space-x-3 mb-3">
                <span class="text-2xl">${data.icon}</span>
                <h3 class="text-white text-lg font-semibold">${data.category}</h3>
                <span class="px-2 py-1 bg-red-500 bg-opacity-20 text-red-300 text-xs rounded-full">${data.priority.toUpperCase()}</span>
            </div>
            <div class="space-y-2">
                ${itemsHtml}
            </div>
        `;
        
        return card;
    },
    
    // Create heatmap cell
    createHeatmapCell(data) {
        const cell = document.createElement('div');
        const tempColor = this.getTemperatureColor(data.temp);
        
        cell.className = `${tempColor} bg-opacity-80 rounded-lg flex items-center justify-center text-white text-xs font-bold interactive-element hover:scale-105 transition-transform`;
        cell.dataset.temp = data.temp;
        cell.dataset.location = data.name;
        
        cell.innerHTML = `${data.temp}°`;
        
        // Add click event for location info
        cell.addEventListener('click', () => {
            this.showLocationInfo(data);
        });
        
        return cell;
    },
    
    getTemperatureColor(temp) {
        if (temp >= 35) return 'bg-red-500';
        if (temp >= 30) return 'bg-orange-500';
        if (temp >= 25) return 'bg-yellow-500';
        return 'bg-green-500';
    },
    
    showLocationInfo(data) {
        // Create modal or tooltip with location info
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="glassmorphism-enhanced rounded-2xl p-6 max-w-sm mx-4">
                <h3 class="text-white text-xl font-bold mb-4">${data.name}</h3>
                <div class="space-y-2">
                    <div class="text-white text-sm">Suhu: <span class="font-bold">${data.temp}°C</span></div>
                    <div class="text-white text-sm">Koordinat: <span class="font-bold">${data.lat}, ${data.lng}</span></div>
                </div>
                <button class="mt-4 btn-glass rounded-xl px-4 py-2 text-white text-sm" onclick="this.parentElement.parentElement.remove()">
                    Tutup
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    }
};

// Chart Management
const ChartManager = {
    createTemperatureChart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const chartHtml = `
            <div class="chart-container">
                <div class="flex items-end justify-between h-full space-x-2">
                    ${WeatherData.forecast.map((day, index) => `
                        <div class="flex flex-col items-center space-y-2 flex-1">
                            <div class="chart-bar bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg w-full" 
                                 style="height: ${(day.high / 40) * 100}%; min-height: 20px;"
                                 data-temp="${day.high}">
                            </div>
                            <div class="text-white text-xs font-semibold">${day.high}°</div>
                            <div class="text-white text-xs opacity-80">${day.day}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = chartHtml;
        
        // Add hover effects
        container.querySelectorAll('.chart-bar').forEach(bar => {
            bar.addEventListener('mouseenter', function() {
                this.style.transform = 'scaleY(1.1)';
                this.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
            });
            
            bar.addEventListener('mouseleave', function() {
                this.style.transform = 'scaleY(1)';
                this.style.boxShadow = 'none';
            });
        });
    },
    
    createPrecipitationChart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const chartHtml = `
            <div class="chart-container">
                <div class="flex items-end justify-between h-full space-x-2">
                    ${WeatherData.forecast.map((day, index) => `
                        <div class="flex flex-col items-center space-y-2 flex-1">
                            <div class="chart-bar bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg w-full" 
                                 style="height: ${day.precipitation}%; min-height: 5px;"
                                 data-precipitation="${day.precipitation}">
                            </div>
                            <div class="text-white text-xs font-semibold">${day.precipitation}%</div>
                            <div class="text-white text-xs opacity-80">${day.day}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = chartHtml;
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    Navigation.init();
    WeatherApp.init();
    ChatAI.init();
    
    // Add loading animation
    document.body.classList.add('fade-in');
    
    // Initialize charts after a short delay
    setTimeout(() => {
        ChartManager.createTemperatureChart('temperatureChart');
        ChartManager.createPrecipitationChart('precipitationChart');
    }, 500);
});

// Export for global access
window.WeatherData = WeatherData;
window.Navigation = Navigation;
window.UIComponents = UIComponents;
window.ChartManager = ChartManager;
