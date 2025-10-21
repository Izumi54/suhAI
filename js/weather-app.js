// Main Weather Application
const WeatherApp = {
    init() {
        this.setupEventListeners();
        this.updateCurrentWeather();
        this.generateForecastSection();
        this.generateRecommendationsSection();
        this.generateHeatmapSection();
        this.addInteractiveFeatures();
        this.simulateWeatherUpdates();
    },
    
    setupEventListeners() {
        // Scroll spy for navigation
        window.addEventListener('scroll', () => {
            this.updateActiveSection();
            this.handleNavbarScroll();
        });
        
        // Resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    },
    
    handleNavbarScroll() {
        const navbar = document.querySelector('nav');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    },
    
    updateActiveSection() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-btn');
        
        let currentSection = '';
        const scrollPosition = window.scrollY + 150; // Offset for sticky header
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id.replace('Section', '');
            }
        });
        
        // Update navigation
        navLinks.forEach(link => {
            link.classList.remove('nav-active');
            if (link.dataset.section === currentSection) {
                link.classList.add('nav-active');
            }
        });
        
        // Update current section in Navigation object
        if (currentSection) {
            Navigation.currentSection = currentSection;
        }
    },
    
    handleResize() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        const isDesktop = window.innerWidth >= 1024;
        
        // Adjust animations based on device
        if (isMobile) {
            document.body.style.setProperty('--animation-duration', '0.3s');
        } else {
            document.body.style.setProperty('--animation-duration', '0.6s');
        }
        
        // Recreate charts on resize
        setTimeout(() => {
            ChartManager.createTemperatureChart('temperatureChart');
            ChartManager.createPrecipitationChart('precipitationChart');
        }, 100);
    },
    
    updateCurrentWeather() {
        const current = WeatherData.current;
        
        // Update temperature display
        const tempElement = document.getElementById('currentTemp');
        if (tempElement) {
            tempElement.textContent = current.temperature + '°';
            tempElement.classList.add('pulse-gentle');
        }
        
        // Update weather condition
        const conditionElement = document.getElementById('weatherCondition');
        if (conditionElement) {
            conditionElement.textContent = current.condition;
        }
        
        // Update feels like
        const feelsLikeElement = document.getElementById('feelsLike');
        if (feelsLikeElement) {
            feelsLikeElement.textContent = `Terasa seperti: ${current.feelsLike}°`;
        }
        
        // Update other weather data
        this.updateWeatherStats();
    },
    
    updateWeatherStats() {
        const current = WeatherData.current;
        
        const stats = {
            humidity: current.humidity + '%',
            uvIndex: current.uvIndex,
            windSpeed: current.windSpeed + ' km/jam',
            pressure: current.pressure + ' hPa',
            airQuality: current.airQuality,
            visibility: current.visibility + ' km'
        };
        
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });
    },
    
    generateForecastSection() {
        const forecastContainer = document.getElementById('forecastList');
        if (!forecastContainer) return;
        
        forecastContainer.innerHTML = '';
        
        WeatherData.forecast.forEach((day, index) => {
            const forecastCard = UIComponents.createWeatherCard(day);
            forecastCard.style.animationDelay = `${index * 0.1}s`;
            forecastCard.classList.add('fade-in-up');
            
            // Add click event for detailed view
            forecastCard.addEventListener('click', () => {
                this.showForecastDetail(day);
            });
            
            forecastContainer.appendChild(forecastCard);
        });
    },
    
    generateRecommendationsSection() {
        const recommendationsContainer = document.getElementById('recommendationsList');
        if (!recommendationsContainer) return;
        
        recommendationsContainer.innerHTML = '';
        
        WeatherData.recommendations.forEach((category, index) => {
            const recommendationCard = UIComponents.createRecommendationCard(category);
            recommendationCard.style.animationDelay = `${index * 0.2}s`;
            recommendationCard.classList.add('fade-in-up');
            
            recommendationsContainer.appendChild(recommendationCard);
        });
    },
    
    generateHeatmapSection() {
        const heatmapContainer = document.getElementById('heatmapGrid');
        if (!heatmapContainer) return;
        
        heatmapContainer.innerHTML = '';
        
        // Generate heatmap grid
        const gridSize = 8; // 8x6 grid
        const locations = WeatherData.heatmap.locations;
        
        for (let i = 0; i < gridSize * 6; i++) {
            const cellData = {
                temp: Math.floor(Math.random() * 20) + 20, // Random temp between 20-40
                name: `Area ${i + 1}`,
                lat: -6.5944 + (Math.random() - 0.5) * 0.1,
                lng: 110.6717 + (Math.random() - 0.5) * 0.1
            };
            
            const cell = UIComponents.createHeatmapCell(cellData);
            heatmapContainer.appendChild(cell);
        }
        
        // Add some real locations
        locations.forEach((location, index) => {
            const cell = UIComponents.createHeatmapCell(location);
            cell.style.gridColumn = `${(index % gridSize) + 1}`;
            cell.style.gridRow = `${Math.floor(index / gridSize) + 1}`;
            heatmapContainer.appendChild(cell);
        });
    },
    
    showForecastDetail(day) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="glassmorphism-enhanced rounded-2xl p-6 max-w-md mx-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white text-xl font-bold">${day.day} - ${day.date}</h3>
                    <button class="text-white opacity-60 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                <div class="text-center mb-6">
                    <div class="text-6xl mb-2">${day.icon}</div>
                    <div class="text-white text-3xl font-bold">${day.high}° / ${day.low}°</div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="glassmorphism-light rounded-xl p-3 text-center">
                        <div class="text-white text-sm opacity-80">Presipitasi</div>
                        <div class="text-white text-lg font-bold">${day.precipitation}%</div>
                    </div>
                    <div class="glassmorphism-light rounded-xl p-3 text-center">
                        <div class="text-white text-sm opacity-80">Kecepatan Angin</div>
                        <div class="text-white text-lg font-bold">${day.wind} km/jam</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 10000);
    },
    
    addInteractiveFeatures() {
        // Add hover effects to cards
        const cards = document.querySelectorAll('.glassmorphism-card, .glassmorphism-light, .glassmorphism-medium, .card-hover-enhanced');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-6px) scale(1.02)';
                this.style.boxShadow = '0 16px 50px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
        });
        
        // Add click effects to buttons
        const buttons = document.querySelectorAll('.btn-glass, .interactive-element');
        buttons.forEach(button => {
            button.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(0) scale(0.98)';
            });
            
            button.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px) scale(1)';
            });
        });
        
        // Add weather icon animations
        const weatherIcons = document.querySelectorAll('.weather-icon');
        weatherIcons.forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1) rotate(5deg)';
            });
            
            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    },
    
    simulateWeatherUpdates() {
        setInterval(() => {
            // Randomly update temperature by ±1 degree
            const currentTemp = WeatherData.current.temperature;
            const newTemp = currentTemp + (Math.random() > 0.5 ? 1 : -1);
            
            if (newTemp >= 30 && newTemp <= 40) {
                WeatherData.current.temperature = newTemp;
                WeatherData.current.feelsLike = newTemp + 5;
                
                // Update UI
                this.updateCurrentWeather();
            }
        }, 30000); // Update every 30 seconds
    }
};

// Export for global access
window.WeatherApp = WeatherApp;
