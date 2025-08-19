class ChatSystem {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.suggestions = document.querySelectorAll('.suggestion-card');
        this.welcomeContainer = document.querySelector('.welcome-container');
        this.chatHistoryContainer = document.querySelector('.chat-history');

        this.isChatPage = !!this.messagesContainer;

        this.chatId = this.getOrCreateChatId();

        this.initializeEventListeners();
        this.autoFocusInput();
        this.loadChatHistory();

        if (this.isChatPage) {
            this.loadMessages();

            const initialMessage = sessionStorage.getItem('initialMessage');
            if (initialMessage) {
                sessionStorage.removeItem('initialMessage');
                this.addUserMessage(initialMessage);
                this.showTypingIndicator();
                this.getAIResponse(initialMessage);
            }
        }
    }

    initializeEventListeners() {
        if (this.messageInput) {
            this.messageInput.addEventListener('input', () => this.handleInputChange());
            this.messageInput.addEventListener('keydown', e => this.handleKeyDown(e));
        }

        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        this.suggestions.forEach(s => s.addEventListener('click', () => this.handleSuggestionClick(s)));

        const newChatBtn = document.querySelector('.new-chat-btn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.createNewChat());
        }
    }

    getOrCreateChatId() {
        let chatId = sessionStorage.getItem('currentChatId');
        if (!chatId) {
            chatId = 'chat_' + Date.now();
            sessionStorage.setItem('currentChatId', chatId);
        }
        return chatId;
    }

    loadChatHistory() {
        if (!this.chatHistoryContainer) return;

        const chats = this.getAllChats();
        this.chatHistoryContainer.innerHTML = '';

        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.innerHTML = `
                <div class="chat-preview" onclick="window.chatSystem.loadChat('${chat.id}')">
                    <span class="chat-title">${chat.title}</span>
                    <span class="chat-time">${chat.time}</span>
                </div>
                <div class="chat-actions">
                    <button class="chat-action-btn" onclick="window.chatSystem.renameChat('${chat.id}')" title="Renombrar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="chat-action-btn delete-btn" onclick="window.chatSystem.deleteChat('${chat.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            this.chatHistoryContainer.appendChild(chatItem);
        });
    }

    getAllChats() {
        const chats = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('chat_')) {
                const content = localStorage.getItem(key);
                if (content) {
                    const title = this.getChatTitle(key);
                    const time = this.formatTime(new Date(parseInt(key.split('_')[1])));
                    chats.push({
                        id: key,
                        title: title,
                        time: time
                    });
                }
            }
        }
        return chats.sort((a, b) => b.id.localeCompare(a.id));
    }

    extractFirstMessage(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const firstUserMessage = doc.querySelector('.user-message .text');
        return firstUserMessage ? firstUserMessage.textContent.substring(0, 30) + '...' : null;
    }

    formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return `${diffDays}d`;
    }

    loadChat(chatId) {
        sessionStorage.setItem('currentChatId', chatId);
        if (this.isChatPage) {
            this.chatId = chatId;
            this.loadMessages();
        } else {
            window.location.href = 'chat.html';
        }
    }

    saveMessages() {
        if (!this.messagesContainer) return;
        localStorage.setItem(this.chatId, this.messagesContainer.innerHTML);
        this.loadChatHistory();
    }

    loadMessages() {
        const savedChat = localStorage.getItem(this.chatId);
        if (savedChat && this.messagesContainer) {
            this.messagesContainer.innerHTML = savedChat;
            this.scrollToBottom();
        }
    }

    handleInputChange() {
        if (!this.messageInput) return;
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        if (this.sendButton) {
            this.sendButton.classList.toggle('active', this.messageInput.value.trim() !== '');
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleSuggestionClick(suggestion) {
        const text = suggestion.querySelector('span').textContent;
        if (this.messageInput) {
            this.messageInput.value = text;
            this.handleInputChange();
            this.messageInput.focus();
        }
    }

    createNewChat() {
        sessionStorage.removeItem('currentChatId');
        sessionStorage.removeItem('initialMessage');
        window.location.href = 'index.html';
    }

    sendMessage() {
        if (!this.messageInput || !this.messageInput.value.trim()) return;

        const text = this.messageInput.value.trim();
        this.messageInput.value = '';
        this.handleInputChange();

        if (this.isChatPage) {
            this.addUserMessage(text);
            this.showTypingIndicator();
            this.getAIResponse(text);
        } else {
            sessionStorage.setItem('initialMessage', text);
            sessionStorage.setItem('currentChatId', this.chatId);
            window.location.href = 'chat.html';
        }
    }

    addUserMessage(text) {
        if (!this.messagesContainer) return;
        const html = `
            <div class="message user-message">
                <div class="message-content">
                    <div class="avatar user-avatar"><i class="fas fa-user"></i></div>
                    <div class="text">${this.escapeHtml(text)}</div>
                </div>
            </div>
        `;
        this.messagesContainer.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();
        this.saveMessages();
    }

    showTypingIndicator() {
        if (!this.messagesContainer) return;
        const html = `
            <div class="message ai-message typing-indicator">
                <div class="message-content">
                    <div class="avatar ai-avatar"><i class="fas fa-robot"></i></div>
                    <div class="text"><div class="typing-animation"><span></span><span></span><span></span></div></div>
                </div>
            </div>
        `;
        this.messagesContainer.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
    }

    async getAIResponse(userMessage) {
        await this.delay(1500 + Math.random() * 1000);
        this.removeTypingIndicator();

        const responses = [
            "¡Hola! 👋 Soy TriqAI, tu asistente especializado en Minecraft.\n\n🚧 Próximamente:\n• Generación de schematics\n• Creación de plugins\n• Traducción de textos\n• Preguntas sobre Minecraft",
            "¡Gracias por usar TriqAI! 🤖 Puedo ayudarte con:\n• Crear plugins\n• Traducir textos\n• Generar estructuras .schem\n• Preguntas sobre mods, plugins y Minecraft en general",
            "¡Hola! Soy TriqAI Beta 🎮 Especializado en Minecraft.\n\nFunciones principales:\n• Generar schematics\n• Crear plugins\n• Traducir textos\n• Resolver cualquier duda sobre Minecraft"
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addAIMessage(response);
    }

    addAIMessage(text) {
        if (!this.messagesContainer) return;
        const html = `
            <div class="message ai-message">
                <div class="message-content">
                    <div class="avatar ai-avatar"><i class="fas fa-robot"></i></div>
                    <div class="text">${this.formatMessage(text)}</div>
                </div>
            </div>
        `;
        this.messagesContainer.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();
        this.saveMessages();
    }

    formatMessage(text) {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        if (this.messagesContainer) this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    autoFocusInput() {
        if (this.messageInput) window.addEventListener('load', () => this.messageInput.focus());
    }

    delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    deleteChat(chatId) {
        this.showCustomConfirm('¿Eliminar conversación?', 'Esta acción no se puede deshacer', (confirmed) => {
            if (confirmed) {
                localStorage.removeItem(chatId);
                const customTitles = JSON.parse(localStorage.getItem('chatTitles') || '{}');
                delete customTitles[chatId];
                localStorage.setItem('chatTitles', JSON.stringify(customTitles));
                this.loadChatHistory();

                if (this.chatId === chatId) {
                    this.createNewChat();
                }
            }
        });
    }

    renameChat(chatId) {
        const currentTitle = this.getChatTitle(chatId);
        this.showCustomPrompt('Renombrar conversación', currentTitle, (newTitle) => {
            if (newTitle && newTitle.trim()) {
                const chatData = localStorage.getItem(chatId);
                if (chatData) {
                    const customTitles = JSON.parse(localStorage.getItem('chatTitles') || '{}');
                    customTitles[chatId] = newTitle.trim();
                    localStorage.setItem('chatTitles', JSON.stringify(customTitles));
                    this.loadChatHistory();
                }
            }
        });
    }

    showCustomPrompt(title, defaultValue, callback) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-prompt-overlay';
        overlay.innerHTML = `
            <div class="custom-prompt-box">
                <h3>${title}</h3>
                <input type="text" id="promptInput" value="${defaultValue}" autocomplete="off">
                <div class="button-group">
                    <button class="cancel-btn" onclick="this.closest('.custom-prompt-overlay').remove()">Cancelar</button>
                    <button onclick="window.chatSystem.handlePromptSubmit('${callback.name}')">Guardar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.getElementById('promptInput').focus();
        document.getElementById('promptInput').select();

        this.currentPromptCallback = callback;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') overlay.remove();
            if (e.key === 'Enter') {
                const input = document.getElementById('promptInput');
                if (input) {
                    callback(input.value);
                    overlay.remove();
                }
            }
        }, { once: true });
    }

    showCustomConfirm(title, message, callback) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-prompt-overlay';
        overlay.innerHTML = `
            <div class="custom-prompt-box">
                <h3>${title}</h3>
                <p style="color: #ccc; margin-bottom: 20px; font-size: 14px;">${message}</p>
                <div class="button-group">
                    <button class="cancel-btn" onclick="this.closest('.custom-prompt-overlay').remove()">No</button>
                    <button class="confirm-btn" onclick="window.chatSystem.handleConfirmSubmit(true)">Sí</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.currentConfirmCallback = callback;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                callback(false);
                overlay.remove();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                callback(false);
                overlay.remove();
            }
        }, { once: true });
    }

    handleConfirmSubmit(confirmed) {
        const overlay = document.querySelector('.custom-prompt-overlay');

        if (this.currentConfirmCallback) {
            this.currentConfirmCallback(confirmed);
            overlay.remove();
        }
    }

    getChatTitle(chatId) {
        const customTitles = JSON.parse(localStorage.getItem('chatTitles') || '{}');
        if (customTitles[chatId]) {
            return customTitles[chatId];
        }

        const content = localStorage.getItem(chatId);
        return content ? this.extractFirstMessage(content) : 'Nueva conversación';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatSystem = new ChatSystem();
});