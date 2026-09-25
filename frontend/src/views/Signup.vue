<script setup>
    import { reactive, ref } from 'vue';
    import '../components/styles/Button.css';

    const error = ref('');
    const success = ref('');
    const loading = ref(false);

    const form = reactive({
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });

    async function handleSubmit() {
        error.value = '';
        success.value = '';

        if (form.password !== form.passwordConfirm) {
            error.value = 'Salasanat eivät täsmää.';
            return;
        }

        if (form.password.length < 8) {
            error.value = 'Salasanan on oltava vähintään 8 merkkiä.';
            return;
        }

        loading.value = true;
        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                error.value = data.error || 'Rekisteröinti epäonnistui.';
                return;
            }

            success.value = data.message || 'Rekisteröinti onnistui!';
            // Reset form on success
            form.username = '';
            form.email = '';
            form.password = '';
            form.passwordConfirm = '';

            // Redirect to signin after a short delay
            setTimeout(() => {
                $router.push('/signin');
            }, 2000);
        } catch {
            error.value = 'Yhteydenotto palvelimeen epäonnistui.';
        } finally {
            loading.value = false;
        }
    }
</script>

<template>
    <div class="signup-page">
        <div class="wrapper">
            <div class="header">
                <h1 class="title">Rekisteröidy</h1>
            </div>
            <form @submit.prevent="handleSubmit">
                <div class="field">
                    <input
                        id="username"
                        v-model="form.username"
                        type="text"
                        class="input"
                        placeholder="Käyttäjänimi"
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
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        class="input"
                        placeholder="Salasana"
                        required
                        minlength="8"
                    >
                </div>
                <div class="field">
                    <input
                        id="passwordConfirm"
                        v-model="form.passwordConfirm"
                        type="password"
                        class="input"
                        placeholder="Vahvista salasana"
                        required
                        minlength="8"
                    >
                </div>
                <p v-if="error" class="form-error">{{ error }}</p>
                <p v-if="success" class="form-success">{{ success }}</p>
                <button type="submit" class="btn-primary btn-large" :disabled="loading">
                    {{ loading ? 'Luodaan tiliä...' : 'Luo tili' }}
                </button>
            </form>
            <p class="footer">
                Onko sinulla jo tili? <a @click="$router.push('/signin')">Kirjaudu sisään</a>
            </p>
        </div>
    </div>
</template>

<style scoped>
    .signup-page {
        background-color: black;
        color: #ffffff;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        position: relative;
        overflow: hidden;
    }

    .wrapper {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 420px;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .title {
        font-size: 2rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        margin: 0 0 0.5rem;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    input {
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
    }

    input::placeholder {
        color: gray;
    }

    input:focus {
        border-color: #00e5ff;
        box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.15);
    }

    .error,
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

    form {
        margin-top: 0.5rem;
    }

    .footer {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: #8a8a9a;
    }

    .footer a {
        color: #00e5ff;
        text-decoration: none;
        cursor: pointer;
        font-weight: 600;
    }

    .footer a:hover {
        text-decoration: underline;
    }
</style>
