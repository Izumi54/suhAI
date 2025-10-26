// AI Chat Management dengan n8n Integration - DEBUG VERSION
const ChatAI = {
    init() {
        console.log('ChatAI.init() dipanggil');
        this.setupChatElements();
        this.setupEventListeners();
        this.showWelcomeMessage();
        console.log('ChatAI initialized');
    },

    setupChatElements() {
        console.log('Setup chat elements...');
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
        
        // Log jika elemen tidak ditemukan
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) {
                console.warn(`Element ${key} tidak ditemukan`);
            }
        });
        
        this.state = {
            isOpen: false,
            hasNewMessage: true,
            isTyping: false,
            n8nEnabled: true
        };
        console.log('Chat elements setup completed');
    },

    setupEventListeners() {
        console.log('Setup event listeners...');
        const e = this.elements;
        
        if (e.chatToggle) {
            e.chatToggle.addEventListener('click', () => {
                console.log('Chat toggle diklik');
                this.toggleChat();
            });
        }

        if (e.sendMessage) {
            e.sendMessage.addEventListener('click', () => {
                console.log('Send button diklik');
                this.sendMessage();
            });
        }

        if (e.chatInput) {
            e.chatInput.addEventListener('keypress', (ev) => {
                if (ev.key === 'Enter') {
                    console.log('Enter key ditekan');
                    this.sendMessage();
                }
            });
        }

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                console.log(`Quick action: ${action}`);
                this.handleQuickAction(action);
            });
        });
        
        console.log('Event listeners setup completed');
    },

    // ==================== n8n INTEGRATION ====================
    
    async sendMessageToN8N(userMessage, context = {}) {
        const n8nWebhookURL = 'https://izumi54.app.n8n.cloud/webhook/chat-bot-suhAI';
        
        console.log('STEP 1: Mencoba konek ke n8n...');
        console.log('URL:', n8nWebhookURL);
        
        const payload = {
            message: userMessage,
            userId: this.getUserId(),
            location: window.WeatherData?.current?.location || 'Jepara',
            currentWeather: window.WeatherData?.current || {},
            timestamp: new Date().toISOString(),
            ...context
        };

        console.log('STEP 2: Payload ke n8n:', payload);

        try {
            console.log('STEP 3: Melakukan fetch...');
            const response = await fetch(n8nWebhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('STEP 4: Response status:', response.status);
            console.log('STEP 5: Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('STEP 6: Parsing JSON response...');
            const data = await response.json();
            console.log('STEP 7: Response SUCCESS dari n8n:', data);
            
            if (data.success && data.data) {
                return data.data.text;
            } else {
                throw new Error('Format response n8n tidak valid');
            }
            
        } catch (error) {
            console.error('STEP ERROR: n8n API Error:', error);
            console.log('Fallback ke response lokal...');
            return this.generateAIResponse(userMessage);
        }
    },

    getUserId() {
        let userId = localStorage.getItem('chatUserId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatUserId', userId);
        }
        return userId;
    },

    // ==================== MODIFIED FUNCTIONS ====================

    async sendMessage() {
        console.log('sendMessage() DIPANGGIL');
        
        const message = this.elements.chatInput.value.trim();
        console.log('Message:', message);
        
        if (!message) {
            console.log('Message kosong, return');
            return;
        }

        // Add user message
        this.addMessage(message, 'user');
        this.elements.chatInput.value = '';
        console.log('User message ditambahkan');

        // Show typing indicator
        this.showTypingIndicator();
        console.log('Typing indicator ditampilkan');

        try {
            let aiResponse;
            
            if (this.state.n8nEnabled) {
                console.log('Menggunakan n8n...');
                aiResponse = await this.sendMessageToN8N(message);
            } else {
                console.log('Menggunakan fallback local...');
                aiResponse = this.generateAIResponse(message);
            }
            
            this.hideTypingIndicator();
            console.log('AI Response diterima:', aiResponse);
            this.addMessage(aiResponse, 'ai');
            
        } catch (error) {
            console.error('Error di sendMessage:', error);
            this.hideTypingIndicator();
            const fallbackResponse = this.generateAIResponse(message);
            this.addMessage(fallbackResponse, 'ai');
        }
    },

    async handleQuickAction(action) {
        console.log('handleQuickAction:', action);
        
        const message = this.getQuickActionMessage(action);
        this.addMessage(message, 'user');
        
        this.showTypingIndicator();
        
        try {
            let aiResponse;
            
            if (this.state.n8nEnabled) {
                aiResponse = await this.sendMessageToN8N(message, { quickAction: action });
            } else {
                aiResponse = this.generateAIResponse(message);
            }
            
            this.hideTypingIndicator();
            this.addMessage(aiResponse, 'ai');
        } catch (error) {
            console.error('Error di handleQuickAction:', error);
            this.hideTypingIndicator();
            const fallbackResponse = this.generateAIResponse(message);
            this.addMessage(fallbackResponse, 'ai');
        }
    },

    // ... (rest of the functions remain the same as previous version)
    // Keep all the existing functions: toggleChat, openChat, closeChat, 
    // addMessage, showTypingIndicator, hideTypingIndicator, etc.
    
    // TAMBAHKAN function yang mungkin missing:
    toggleChat() {
        console.log('toggleChat dipanggil');
        this.state.isOpen = !this.state.isOpen;
        
        if (this.state.isOpen) {
            this.openChat();
        } else {
            this.closeChat();
        }
    },
    
    openChat() {
        console.log('openChat dipanggil');
        this.elements.chatWindow.classList.remove('hidden');
        this.elements.chatIcon.classList.add('hidden');
        this.elements.closeIcon.classList.remove('hidden');
        this.elements.chatBadge.classList.add('hidden');
        this.state.hasNewMessage = false;
        this.elements.chatInput.focus();
    },
    
    closeChat() {
        console.log('CloseChat dipanggil');
        this.elements.chatWindow.classList.add('hidden');
        this.elements.chatIcon.classList.remove('hidden');
        this.elements.closeIcon.classList.add('hidden');
        this.state.isOpen = false;
    },

    addMessage(text, sender) {
        console.log(`addMessage: ${sender} - ${text.substring(0, 50)}...`);
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
        console.log('showTypingIndicator');
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
        console.log('hideTypingIndicator');
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.state.isTyping = false;
    },

    generateAIResponse(userMessage) {
        console.log('generateAIResponse fallback');
        return "Maaf, saya sedang offline. Silakan coba lagi nanti.";
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
    console.log('DOM Content Loaded - Initializing ChatAI...');
    ChatAI.init();
});

