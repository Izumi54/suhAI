// AI Chat Management
const ChatAI = {
    init() {
        this.setupChatElements();
        this.setupEventListeners();
        this.showWelcomeMessage();
    },
    
    setupChatElements() {
        this.elements = {
            chatToggle: document.getElementById('chatToggle'),
            chatWindow: document.getElementById('chatWindow'),
            chatIcon: document.getElementById('chatIcon'),
            closeIcon: document.getElementById('closeIcon'),
            chatBadge: document.getElementById('chatBadge'),
            minimizeChat: document.getElementById('minimizeChat'),
            chatInput: document.getElementById('chatInput'),
            sendMessage: document.getElementById('sendMessage'),
            chatMessages: document.getElementById('chatMessages')
        };
        
        this.state = {
            isOpen: false,
            hasNewMessage: true,
            isTyping: false
        };
    },
    
    
  setupEventListeners() {
  const e = this.elements;
  
  // Toggle chat window
  if (e.chatToggle) e.chatToggle.addEventListener('click', () => this.toggleChat());

  // Minimize chat
  if (e.minimizeChat) e.minimizeChat.addEventListener('click', () => this.closeChat());

  // Send message
  if (e.sendMessage) e.sendMessage.addEventListener('click', () => this.sendMessage());

  // Enter key
  if (e.chatInput) e.chatInput.addEventListener('keypress', (ev) => {
    if (ev.key === 'Enter') this.sendMessage();
  });


        
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Auto-hide badge
        this.setupBadgeAutoHide();
    },
    
    toggleChat() {
        this.state.isOpen = !this.state.isOpen;
        
        if (this.state.isOpen) {
            this.openChat();
        } else {
            this.closeChat();
        }
    },
    
    openChat() {
        this.elements.chatWindow.classList.remove('hidden');
        this.elements.chatIcon.classList.add('hidden');
        this.elements.closeIcon.classList.remove('hidden');
        this.elements.chatBadge.classList.add('hidden');
        this.state.hasNewMessage = false;
        this.elements.chatInput.focus();
    },
    
    closeChat() {
        this.elements.chatWindow.classList.add('hidden');
        this.elements.chatIcon.classList.remove('hidden');
        this.elements.closeIcon.classList.add('hidden');
        this.state.isOpen = false;
    },
    
    sendMessage() {
        const message = this.elements.chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.elements.chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            const aiResponse = this.generateAIResponse(message);
            this.addMessage(aiResponse, 'ai');
        }, 1000 + Math.random() * 1000);
    },
    
    handleQuickAction(action) {
        const message = this.getQuickActionMessage(action);
        this.addMessage(message, 'user');
        
        this.showTypingIndicator();
        setTimeout(() => {
            this.hideTypingIndicator();
            const aiResponse = this.generateAIResponse(message);
            this.addMessage(aiResponse, 'ai');
        }, 1000);
    },
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message flex items-start space-x-2';
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="flex-1"></div>
                <div class="glassmorphism-light rounded-2xl rounded-tr-sm p-3 max-w-xs">
                    <div class="text-mode text-sm">${text}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-mode" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                </div>
                <div class="glassmorphism-light rounded-2xl rounded-tl-sm p-3 max-w-xs">
                    <div class="text-mode text-sm whitespace-pre-line">${text}</div>
                </div>
            `;
        }
        
        this.elements.chatMessages.appendChild(messageDiv);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        
        // Show notification badge if chat is closed
        if (!this.state.isOpen && sender === 'ai') {
            this.elements.chatBadge.classList.remove('hidden');
            this.state.hasNewMessage = true;
        }
    },
    
    showTypingIndicator() {
        if (this.state.isTyping) return;
        
        this.state.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message flex items-start space-x-2';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-mode" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
            </div>
            <div class="glassmorphism-light rounded-2xl rounded-tl-sm p-3">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-white rounded-full typing-indicator"></div>
                    <div class="w-2 h-2 bg-white rounded-full typing-indicator" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-white rounded-full typing-indicator" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        `;
        
        this.elements.chatMessages.appendChild(typingDiv);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    },
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.state.isTyping = false;
    },
    
    generateAIResponse(userMessage) {
        const responses = {
            weather: [
                `Saat ini suhu di Jepara adalah ${WeatherData.current.temperature}°C dengan kondisi ${WeatherData.current.condition.toLowerCase()}. Indeks UV sangat tinggi (${WeatherData.current.uvIndex}), jadi pastikan untuk menggunakan tabir surya jika keluar rumah! ☀️`,
                `Cuaca hari ini cukup panas dengan suhu ${WeatherData.current.temperature}°C. Kelembapan ${WeatherData.current.humidity}% dan kecepatan angin ${WeatherData.current.windSpeed} km/jam. Disarankan untuk menghindari aktivitas luar ruangan antara pukul 11:00-15:00.`,
                `Kondisi cuaca saat ini: ${WeatherData.current.temperature}°C, ${WeatherData.current.condition.toLowerCase()}. Terasa seperti ${WeatherData.current.feelsLike}°C karena kelembapan tinggi. Pastikan untuk minum air putih yang cukup! 💧`
            ],
            forecast: [
                `Berikut prediksi cuaca 7 hari ke depan:\n• Hari ini: ${WeatherData.forecast[0].high}°C, ${WeatherData.forecast[0].condition}\n• Besok: ${WeatherData.forecast[1].high}°C, ${WeatherData.forecast[1].condition}\n• Sabtu: ${WeatherData.forecast[2].high}°C, ${WeatherData.forecast[2].condition}\n• Minggu: ${WeatherData.forecast[3].high}°C, ${WeatherData.forecast[3].condition}\n• Senin: ${WeatherData.forecast[4].high}°C, ${WeatherData.forecast[4].condition}\n• Selasa: ${WeatherData.forecast[5].high}°C, ${WeatherData.forecast[5].condition}\n• Rabu: ${WeatherData.forecast[6].high}°C, ${WeatherData.forecast[6].condition}\n\nSiapkan payung untuk akhir pekan! ☔`,
                `Prediksi cuaca menunjukkan tren yang cukup stabil dengan suhu berkisar ${Math.min(...WeatherData.forecast.map(d => d.high))}-${Math.max(...WeatherData.forecast.map(d => d.high))}°C. Akan ada hujan ringan di akhir pekan, jadi rencanakan aktivitas outdoor dengan baik! 📅`
            ],
            recommendations: [
                `Berdasarkan kondisi cuaca saat ini, berikut rekomendasi saya:\n\n💧 **Hidrasi**: Minum minimal 2-3 liter air per hari\n☀️ **Perlindungan**: Gunakan tabir surya SPF 30+ dan topi\n👕 **Pakaian**: Pilih bahan katun yang menyerap keringat\n🏠 **Rumah**: Pastikan ventilasi baik dan gunakan kipas angin\n\nHindari aktivitas berat di luar ruangan antara 11:00-15:00!`,
                `Untuk kondisi cuaca panas seperti ini, saya sarankan:\n• Minum air putih setiap jam\n• Konsumsi buah-buahan kaya air\n• Gunakan pakaian longgar dan berwarna terang\n• Cari tempat teduh saat berada di luar\n\nStay hydrated! 💪`
            ],
            health: [
                `Tips kesehatan untuk cuaca panas:\n\n🌡️ **Dehidrasi**: Waspada gejala pusing, lemas, dan mulut kering\n💊 **Suplemen**: Pertimbangkan elektrolit untuk mengganti mineral yang hilang\n🏃 **Olahraga**: Lakukan di pagi atau sore hari\n🍎 **Makanan**: Hindari makanan berat, pilih yang segar dan ringan\n\nJika merasa tidak enak badan, segera cari tempat teduh dan minum air!`,
                `Kesehatan Anda penting! Dengan suhu ${WeatherData.current.temperature}°C dan indeks UV tinggi:\n• Gunakan topi lebar dan kacamata hitam\n• Aplikasikan tabir surya setiap 2 jam\n• Istirahat di tempat teduh setiap 30 menit\n• Perhatikan tanda-tanda heat stroke\n\nJaga kesehatan Anda! 🏥`
            ],
            default: [
                "Saya bisa membantu Anda dengan informasi cuaca, prediksi 7 hari, rekomendasi kesehatan, dan tips untuk kondisi cuaca saat ini. Ada yang spesifik ingin Anda tanyakan? 😊",
                "Halo! Saya SuhAI Assistant. Saya bisa memberikan informasi cuaca terkini, prediksi, dan saran kesehatan berdasarkan kondisi cuaca. Bagaimana saya bisa membantu Anda hari ini? 🌤️",
                "Saya di sini untuk membantu! Anda bisa bertanya tentang cuaca hari ini, prediksi minggu depan, atau tips kesehatan untuk kondisi cuaca panas. Apa yang ingin Anda ketahui? 💡"
            ]
        };
        
        const message = userMessage.toLowerCase();
        
        if (message.includes('cuaca') || message.includes('hari ini')) {
            return responses.weather[Math.floor(Math.random() * responses.weather.length)];
        } else if (message.includes('prediksi') || message.includes('7 hari') || message.includes('besok')) {
            return responses.forecast[Math.floor(Math.random() * responses.forecast.length)];
        } else if (message.includes('rekomendasi') || message.includes('saran') || message.includes('tips')) {
            return responses.recommendations[Math.floor(Math.random() * responses.recommendations.length)];
        } else if (message.includes('kesehatan') || message.includes('sehat') || message.includes('dehidrasi')) {
            return responses.health[Math.floor(Math.random() * responses.health.length)];
        } else {
            return responses.default[Math.floor(Math.random() * responses.default.length)];
        }
    },
    
    getQuickActionMessage(action) {
        const messages = {
            weather: "Bagaimana cuaca hari ini?",
            forecast: "Apa prediksi cuaca 7 hari ke depan?",
            recommendations: "Berikan rekomendasi untuk cuaca saat ini",
            health: "Tips kesehatan untuk cuaca panas"
        };
        return messages[action] || "Halo!";
    },
    
    showWelcomeMessage() {
        // Show welcome message after 3 seconds
        setTimeout(() => {
            if (!this.state.isOpen) {
                this.elements.chatBadge.classList.remove('hidden');
                this.state.hasNewMessage = true;
            }
        }, 3000);
    },
    
    setupBadgeAutoHide() {
        setInterval(() => {
            if (this.state.hasNewMessage && !this.state.isOpen) {
                setTimeout(() => {
                    if (!this.state.isOpen) {
                        this.elements.chatBadge.classList.add('hidden');
                        this.state.hasNewMessage = false;
                    }
                }, 5000);
            }
        }, 1000);
    }
};

// Export for global access
window.ChatAI = ChatAI;
document.addEventListener('DOMContentLoaded', () => {
  ChatAI.init();
});

