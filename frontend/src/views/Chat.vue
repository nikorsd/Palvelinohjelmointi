<script setup lang="ts">
    import { ref, nextTick, onMounted } from 'vue';
    import { useAuth } from '@/composables/auth';
    import '../components/styles/Button.css';

    const { user } = useAuth();

    interface ChatMessage {
        id: number;
        user_id: number;
        username: string;
        message: string;
        profileColor: string | null;
        created_at: string;
    }

    const messages = ref<ChatMessage[]>([]);
    const inputMessage = ref('');
    const error = ref('');
    const loading = ref(true);
    const chatContainer = ref<HTMLElement | null>(null);

    const colors = ['#00e5ff', '#ff4081', '#7c4dff', '#00e676', '#ffab40', '#ff1744', '#2979ff', '#ffffff'];

    async function fetchMessages() {
        try {
            const res = await fetch('/api/chat');
            if (!res.ok) {
                error.value = 'Viestien lataaminen epäonnistui.';
                return;
            }
            const data = await res.json();
            messages.value = data.messages || [];
        } catch {
            error.value = 'Yhteydenotto palvelimeen epäonnistui.';
        } finally {
            loading.value = false;
        }
    }

    async function sendMessage() {
        const text = inputMessage.value.trim();
        if (!text || !user.value) return;

        error.value = '';
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message: text }),
            });
            if (!res.ok) {
                const data = await res.json();
                error.value = data.error || 'Viestin lähettäminen epäonnistui.';
                return;
            }
            inputMessage.value = '';
            await fetchMessages();
        } catch {
            error.value = 'Yhteydenotto palvelimeen epäonnistui.';
        }
    }

    function getTimeString(timestamp: string): string {
        return new Date(timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
    }

    function getInitials(username: string): string {
        return username
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    function isOwnMessage(msg: ChatMessage): boolean {
        return user.value?.id === msg.user_id;
    }

    function getAvatarColor(msg: ChatMessage): string {
        if (msg.profileColor) return msg.profileColor;
        let hash = 0;
        for (let i = 0; i < msg.username.length; i++) {
            hash = msg.username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const idx = Math.abs(hash) % colors.length;
        return colors[idx]!;
    }

    async function scrollToBottom() {
        await nextTick();
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
    }

    onMounted(async () => {
        await fetchMessages();
        await scrollToBottom();
    });

    let interval: ReturnType<typeof setInterval> | null = null;
    onMounted(() => {
        interval = setInterval(fetchMessages, 3000);
    });
</script>

<template>
    <div class="chat-page">
        <div class="chat-wrapper">
            <header class="chat-header">
                <h1 class="title">Keskustelu</h1>
            </header>

            <div ref="chatContainer" class="messages">
                <div v-if="loading" class="loading-state">
                    <p>Ladataan viestejä...</p>
                </div>

                <div v-else-if="error" class="error-state">
                    <p>{{ error }}</p>
                    <button class="btn-retry" @click="fetchMessages">Yritä uudelleen</button>
                </div>

                <div v-else-if="messages.length === 0" class="empty-state">
                    <p>Ei vielä viestejä</p>
                </div>

                <template v-else>
                    <div
                        v-for="msg in messages"
                        :key="msg.id"
                        class="message"
                    >
                        <div class="message-avatar" :style="{ backgroundColor: getAvatarColor(msg) }">
                            {{ getInitials(msg.username) }}
                        </div>
                        <div class="message-content">
                            <div class="message-meta">
                                <span class="message-author" :style="{ color: getAvatarColor(msg) }">
                                    {{ msg.username }}
                                </span>
                                <span class="message-time">{{ getTimeString(msg.created_at) }}</span>
                            </div>
                            <p class="message-text">{{ msg.message }}</p>
                        </div>
                    </div>
                </template>
            </div>
            <hr>
            <div class="chat-input-area">
                <form v-if="user" class="input-form" @submit.prevent="sendMessage">
                    <input
                        v-model="inputMessage"
                        type="text"
                        class="input"
                        placeholder="Kirjoita viesti..."
                        required
                    >
                    <button type="submit" class="btn-send" :disabled="!inputMessage.trim()">
                        Lähetä
                    </button>
                </form>
                <div v-else class="login-prompt">
                    <button class="btn-login" @click="$router.push('/signin')">
                        Kirjaudu sisään keskustellaksesi
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .chat-page {
        background-color: black;
        color: white;
        height: 93vh;
        display: flex;
        flex-direction: column;
    }

    .chat-wrapper {
        display: flex;
        flex-direction: column;
        flex: 1;
        max-width: 800px;
        width: 100%;
        margin: 0 auto;
        padding: 2rem 1.5rem;
        overflow: scroll;
    }

    .chat-header {
        text-align: center;
        margin-bottom: 1.5rem;
        flex-shrink: 0;
    }

    .title {
        font-size: 2rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        margin: 0 0 0.25rem;
    }

    .messages {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0 0 1rem;
    }

    .message {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 0.5rem 0;
    }

    .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 700;
        color: black;
        flex-shrink: 0;
    }

    .message-content {
        flex: 1;
        min-width: 0;
    }

    .message-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
    }

    .message-author {
        font-size: 0.85rem;
        font-weight: 700;
    }

    .message-time {
        font-size: 0.75rem;
        color: gray;
    }

    .message-text {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.5;
        color: white;
        word-break: break-word;
    }

    .chat-input-area {
        flex-shrink: 0;
        padding-top: 1rem;
        margin-top: 0.5rem;
    }

    .input-form {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .input-form .input {
        flex: 1;
        padding: 0.75rem 1rem;
        font-size: 0.95rem;
        color: white;
        background: rgb(30,30,30);
        border: none;
        border-radius: 8px;
        outline: none;
        font-family: inherit;
        box-sizing: border-box;
    }

    .input-form .input::placeholder {
        color: #5a5a6a;
    }

    .input-form .input:focus {
        box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.15);
    }

    .btn-send {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.5rem;
        font-size: 0.95rem;
        font-weight: 700;
        color: black;
        background: #00e5ff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
    }

    .btn-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .login-prompt {
        display: flex;
        justify-content: center;
        padding: 0.5rem 0;
    }

    .btn-login {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.5rem;
        font-size: 0.95rem;
        font-weight: 700;
        color: black;
        background: #00e5ff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
    }

    .btn-login:hover {
        opacity: 0.85;
    }

    .loading-state,
    .error-state,
    .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        padding: 3rem 0;
        color: #8a8a9a;
    }

    .loading-state p,
    .empty-state p {
        margin: 0;
    }

    .btn-retry {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1.25rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: white;
        background: #1a1a2a;
        border: 1px solid #2a2a3a;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
        .chat-wrapper {
            padding: 1.5rem 1rem;
        }

        .title {
            font-size: 1.5rem;
        }
    }
</style>
