<script setup>
    import { reactive, ref } from 'vue';
    import '../components/styles/Button.css';

    const error = ref('');
    const success = ref('');
    const loading = ref(false);

    const form = reactive({
        subject: '',
        email: '',
        message: '',
    });

    async function handleSubmit() {
        error.value = '';
        success.value = '';
        loading.value = true;
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                error.value = data.error || 'Lähetys epäonnistui.';
                return;
            }

            success.value = data.message || 'Viesti lähetetty!';
            form.subject = '';
            form.email = '';
            form.message = '';

            setTimeout(() => { success.value = ''; }, 5000);
        } catch {
            error.value = 'Yhteydenotto palvelimeen epäonnistui.';
        } finally {
            loading.value = false;
        }
    }
</script>

<template>
    <div class="contact-page">
        <div class="wrapper">
            <div class="header">
                <h1 class="title">Ota yhteyttä</h1>
                <p class="subtitle">Palautetta? Kysymyksiä, pistä viestiä</p>
            </div>
            <form @submit.prevent="handleSubmit">
                <div class="field">
                    <input
                        id="subject"
                        v-model="form.subject"
                        type="text"
                        class="input"
                        placeholder="Aihe"
                        required
                    >
                </div>
                <div class="field">
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        class="input"
                        placeholder="Sähköposti"
                        required
                    >
                </div>
                <div class="field">
                    <textarea
                        id="message"
                        v-model="form.message"
                        class="input textarea"
                        placeholder="Viesti"
                        rows="5"
                        required
                    ></textarea>
                </div>
                <p v-if="error" class="form-error">{{ error }}</p>
                <p v-if="success" class="form-success">{{ success }}</p>
                <button type="submit" class="btn-primary btn-large" :disabled="loading">
                    {{ loading ? 'Lähetetään...' : 'Lähetä viesti' }}
                </button>
            </form>
            <br>
            <div class="footer">
                <h5>Tai sähköpostilla</h5>
                <p class="subtitle">yhteydenotto@siistit-lanit.com</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .contact-page {
        background-color: black;
        color: #ffffff;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
    }

    .wrapper {
        width: 100%;
        max-width: 520px;
    }

    .header, .footer {
        text-align: center;
        margin-bottom: 2rem;
    }

    .title {
        font-size: 2rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        margin: 0 0 0.5rem;
    }

    .subtitle {
        color: #8a8a9a;
        font-size: 1rem;
        margin: 0;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    input,
    textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        color: white;
        background: #0d0d14;
        border: 1px solid #1a1a2a;
        border-radius: 8px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
        box-sizing: border-box;
    }

    textarea {
        resize: vertical;
        min-height: 120px;
    }

    input::placeholder,
    textarea::placeholder {
        color: gray;
    }

    input:focus,
    textarea:focus {
        border-color: #00e5ff;
        box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.15);
    }

    .form-error {
        color: red;
        font-size: 0.85rem;
        margin: 0;
        text-align: center;
    }

    .form-success {
        color: #00e5ff;
        font-size: 0.85rem;
        margin: 0;
        text-align: center;
    }
</style>
