class ChatSystem {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.suggestions = document.querySelectorAll('.suggestion-card');
        this.welcomeContainer = document.querySelector('.welcome-container');

        this.isIndexPage = !this.messagesContainer;

        this.initializeEventListeners();
        this.autoFocusInput();

        if (!this.isIndexPage) {
            this.handleInitialMessage();
        }
    }

    initializeEventListeners() {
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

        this.sendButton.addEventListener('click', () => this.sendMessage());

        this.suggestions.forEach(suggestion => {
            suggestion.addEventListener('click', () => this.handleSuggestionClick(suggestion));
        });
    }

    handleInputChange() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';

        if (this.messageInput.value.trim()) {
            this.sendButton.classList.add('active');
        } else {
            this.sendButton.classList.remove('active');
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.messageInput.value.trim()) {
                if (this.isIndexPage) {
                    this.redirectToChat();
                } else {
                    this.sendMessage();
                }
            }
        }
    }

    handleSuggestionClick(suggestion) {
        const text = suggestion.querySelector('span').textContent;
        this.messageInput.value = text;
        this.handleInputChange();
        this.messageInput.focus();
    }

    redirectToChat() {
        const message = this.messageInput.value.trim();
        if (message) {
            sessionStorage.setItem('initialMessage', message);
        }
        window.location.href = 'chat.html';
    }

    sendMessage() {
        if (this.isIndexPage) {
            this.redirectToChat();
            return;
        }

        const messageText = this.messageInput.value.trim();
        if (!messageText) return;

        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.sendButton.classList.remove('active');

        if (this.welcomeContainer) {
            this.welcomeContainer.style.display = 'none';
        }

        if (this.messagesContainer) {
            this.messagesContainer.style.display = 'block';
        }

        this.addUserMessage(messageText);

        this.showTypingIndicator();
        this.getAIResponse(messageText);
    }

    addUserMessage(text) {
        const messageHtml = `
            <div class="message user-message">
                <div class="message-content">
                    <div class="avatar user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="text">${this.escapeHtml(text)}</div>
                </div>
            </div>
        `;

        if (this.messagesContainer) {
            this.messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
            this.scrollToBottom();
        }
    }

    showTypingIndicator() {
        const typingHtml = `
            <div class="message ai-message typing-indicator">
                <div class="message-content">
                    <div class="avatar ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="text">
                        <div class="typing-animation">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (this.messagesContainer) {
            this.messagesContainer.insertAdjacentHTML('beforeend', typingHtml);
            this.scrollToBottom();
        }
    }

    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async getAIResponse(userMessage) {
        await this.delay(1500 + Math.random() * 1000);

        this.removeTypingIndicator();

        const responses = [
            "¡Hola! 👋 Soy TriqAI, tu asistente especializado en Minecraft. Actualmente estoy en **versión BETA**, por lo que mis capacidades están siendo perfeccionadas.\n\n🚧 **Próximamente:**\n• Programación avanzada de plugins\n• Generación de estructuras .schem\n• Análisis de código optimizado\n• Y muchas más características\n\n¡Gracias por tu paciencia mientras mejoro! 🚀",

            "¡Gracias por probar TriqAI! 🤖\n\nActualmente estoy en fase **BETA** y mis desarrolladores están trabajando duro para implementar funciones increíbles:\n\n✨ **En desarrollo:**\n• Sistema de respuestas inteligentes\n• Creación automática de plugins\n• Asistencia en construcciones\n• Traducción avanzada\n\n¡Pronto estaré completamente operativo! 💜",

            "¡Hola! Soy TriqAI Beta 🎮\n\nMe especializo en **Minecraft** pero aún estoy aprendiendo. Mis creadores están implementando nuevas funciones cada día.\n\n🔜 **Próximas actualizaciones:**\n• Respuestas contextual es\n• Generación de código Spigot/Paper\n• Consejos de construcción\n• Y mucho más...\n\n¡Mantente atento a las actualizaciones! ⚡"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addAIMessage(randomResponse);
    }

    addAIMessage(text) {
        const messageHtml = `
            <div class="message ai-message">
                <div class="message-content">
                    <div class="avatar ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="text">${this.formatMessage(text)}</div>
                    <div class="message-actions">
                        <button class="action-btn" title="Copiar" onclick="chatSystem.copyMessage(this)">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn" title="Me gusta">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        <button class="action-btn" title="No me gusta">
                            <i class="fas fa-thumbs-down"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (this.messagesContainer) {
            this.messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
            this.scrollToBottom();
        }
    }

    copyMessage(button) {
        const messageText = button.closest('.message-content').querySelector('.text').textContent;
        navigator.clipboard.writeText(messageText).then(() => {
            const icon = button.querySelector('i');
            icon.classList.remove('fa-copy');
            icon.classList.add('fa-check');

            setTimeout(() => {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-copy');
            }, 1000);
        });
    }

    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/•/g, '&bull;')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    autoFocusInput() {
        if (this.messageInput) {
            window.addEventListener('load', () => {
                this.messageInput.focus();
            });
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleInitialMessage() {
        const initialMessage = sessionStorage.getItem('initialMessage');
        if (initialMessage) {
            sessionStorage.removeItem('initialMessage');
            setTimeout(() => {
                this.messageInput.value = initialMessage;
                this.sendMessage();
            }, 500);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatSystem = new ChatSystem();
});