<script setup lang="ts">
    import { ref, watch } from 'vue';

    interface Contact {
        id: number;
        subject: string;
        email: string;
        message: string;
        created_at: string;
    }

    const props = defineProps<{ contact: Contact | null }>();

    const emit = defineEmits<{
        closed: [];
    }>();

    watch(() => props.contact, (c) => {
        if (!c) emit('closed');
    });

    function close() {
        emit('closed');
    }
</script>

<template>
    <div v-if="contact" class="contact-viewer">
        <div class="contact-card">
            <div class="contact-header">
                <h3 class="contact-title">Yhteydenotto</h3>
                <button class="btn-close" @click="close">Sulje</button>
            </div>

            <div class="contact-info">
                <div class="field">
                    <label class="label">AIHE</label>
                    <p class="value">{{ contact.subject }}</p>
                </div>
                <div class="field">
                    <label class="label">SÄHKÖPOSTI</label>
                    <p class="value">{{ contact.email }}</p>
                </div>
                <div class="field">
                    <label class="label">LÄHETETTY</label>
                    <p class="value">{{ new Date(contact.created_at).toLocaleString('fi-FI') }}</p>
                </div>
                <div class="field">
                    <label class="label">VIESTI</label>
                    <p class="value message">{{ contact.message }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .contact-viewer {
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .contact-card {
        background: #0d0d14;
        border: 1px solid #1a1a2a;
        border-radius: 8px;
        padding: 1.25rem;
    }

    .contact-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .contact-title {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0;
    }

    .contact-info {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    .label {
        font-size: 0.7rem;
        font-weight: 600;
        color: #8a8a9a;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .value {
        font-size: 0.9rem;
        color: #ffffff;
        line-height: 1.5;
        margin: 0;
    }

    .value.message {
        white-space: pre-wrap;
        word-break: break-word;
    }

    .btn-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.4rem 1rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: #8a8a9a;
        background: #1a1a2a;
        border: 1px solid #2a2a3a;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
    }

    .btn-close:hover {
        background: #2a2a3a;
        border-color: #00e5ff;
        color: white;
    }
</style>
