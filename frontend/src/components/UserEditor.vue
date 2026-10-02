<script setup lang="ts">
    import { reactive, ref, watch, onMounted } from 'vue';
    import { useAuth, type AdminUser } from '@/composables/auth';
    import '../components/styles/Button.css';

    const props = defineProps<{ user: AdminUser | null }>();
    const { fetchMe } = useAuth();

    const emit = defineEmits<{
        updated: [];
        deleted: [];
    }>();

    const error = ref('');
    const success = ref('');
    const loading = ref(false);
    const deleting = ref(false);

    const form = reactive({
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: 'User',
        profileColor: '#00e5ff',
    });

    const colors = ['#00e5ff', '#ff4081', '#7c4dff', '#00e676', '#ffab40', '#ff1744', '#2979ff', '#ffffff'];

    watch(() => props.user, (u) => {
        if (u) {
            form.username = u.username;
            form.email = u.email;
            form.role = u.role || 'User';
            form.profileColor = u.profileColor || '#00e5ff';
            form.password = '';
            form.passwordConfirm = '';
            error.value = '';
            success.value = '';
        }
    }, { immediate: true });

    function pickColor(color: string) {
        form.profileColor = color;
    }

    async function handleUpdate() {
        error.value = '';
        success.value = '';

        if (form.password && form.password.length < 8) {
            error.value = 'Salasanan täytyy olla vähintään 8 merkkiä.';
            return;
        }

        if (form.password && form.password !== form.passwordConfirm) {
            error.value = 'Salasanat eivät täsmää.';
            return;
        }

        loading.value = true;
        try {
            const body: Record<string, string> = {
                username: form.username,
                email: form.email,
                role: form.role,
                profileColor: form.profileColor,
            };
            if (form.password) body.password = form.password;

            const res = await fetch(`/api/admin/users/${props.user!.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                error.value = data.error || 'Päivittäminen epäonnistui.';
                return;
            }

            success.value = 'Käyttäjä päivitetty!';
            form.password = '';
            form.passwordConfirm = '';
            await fetchMe();
            emit('updated');

            setTimeout(() => { success.value = ''; }, 3000);
        } catch {
            error.value = 'Yhteydenotto palvelimeen epäonnistui.';
        } finally {
            loading.value = false;
        }
    }

    async function handleDelete() {
        if (!confirm(`Haluatko varmasti poistaa käyttäjän "${props.user?.username}"? Tätä toimintoa ei voi peruuttaa.`)) return;

        deleting.value = true;
        error.value = '';
        try {
            const res = await fetch(`/api/admin/users/${props.user!.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) {
                const data = await res.json();
                error.value = data.error || 'Poistaminen epäonnistui.';
                deleting.value = false;
                return;
            }

            success.value = 'Käyttäjä poistettu!';
            emit('deleted');
            setTimeout(() => { success.value = ''; }, 3000);
        } catch {
            error.value = 'Yhteydenotto palvelimeen epäonnistui.';
        } finally {
            deleting.value = false;
        }
    }
</script>

<template>
    <div v-if="user" class="user-editor">
        <div class="wrapper">
            <div class="header">
                <h1 class="title">Käyttäjä</h1>
            </div>

            <!-- Profile picture / color picker -->
            <div class="profile-section">
                <div class="avatar" :style="{ backgroundColor: form.profileColor }">
                    {{ user?.username?.charAt(0).toUpperCase() || 'K' }}
                </div>
                <div class="color-picker">
                    <div class="color-options">
                        <button
                            v-for="color in colors"
                            :key="color"
                            class="color-btn"
                            :class="{ active: form.profileColor === color }"
                            :style="{ backgroundColor: color }"
                            @click="pickColor(color)"
                        ></button>
                    </div>
                </div>
            </div>

            <form @submit.prevent="handleUpdate">
                <div class="field">
                    <label class="label">Käyttäjänimi</label>
                    <input
                        v-model="form.username"
                        type="text"
                        class="input"
                        placeholder="Käyttäjänimi"
                        required
                    >
                </div>
                <div class="field">
                    <label class="label">Sähköposti</label>
                    <input
                        v-model="form.email"
                        type="email"
                        class="input"
                        placeholder="Sähköposti"
                        required
                    >
                </div>
                <div class="field">
                    <label class="label">Rooli</label>
                    <select v-model="form.role" class="input">
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <div class="field">
                    <label class="label">Uusi salasana</label>
                    <input
                        v-model="form.password"
                        type="password"
                        class="input"
                        placeholder="Jätä tyhjäksi, jos et halua vaihtaa"
                        minlength="8"
                    >
                </div>
                <div class="field">
                    <label class="label">Vahvista salasana</label>
                    <input
                        v-model="form.passwordConfirm"
                        type="password"
                        class="input"
                        placeholder="Vahvista salasana"
                        minlength="8"
                    >
                </div>
                <p v-if="error" class="form-error">{{ error }}</p>
                <p v-if="success" class="form-success">{{ success }}</p>
                <button type="submit" class="btn-primary btn-large" :disabled="loading">
                    {{ loading ? 'Päivitetään...' : 'Päivitä käyttäjä' }}
                </button>
            </form>

            <div class="divider"></div>

            <div class="danger-zone">
                <h3 class="danger-title">Vaarallinen alue</h3>
                <p class="danger-text">Et voi peruuttaa tätä</p>
                <button class="btn-danger" :disabled="deleting" @click="handleDelete">
                    {{ deleting ? 'Poistetaan...' : 'Poista käyttäjä' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .user-editor {
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
        max-width: 480px;
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

    /* Profile section */
    .profile-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 2rem;
        gap: 1rem;
    }

    .avatar {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: 700;
        color: #050508;
        border: 3px solid rgba(255, 255, 255, 0.1);
    }

    .color-picker {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .color-options {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .color-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform 0.15s, border-color 0.2s;
    }

    .color-btn:hover {
        transform: scale(1.15);
    }

    .color-btn.active {
        border-color: #ffffff;
        transform: scale(1.15);
    }

    /* Form */
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

    .label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #8a8a9a;
    }

    input,
    select {
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

    input::placeholder {
        color: gray;
    }

    input:focus,
    select:focus {
        border-color: #00e5ff;
        box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.15);
    }

    select {
        appearance: none;
        cursor: pointer;
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

    /* Divider */
    .divider {
        border: none;
        border-top: 1px solid #1a1a2a;
        margin: 2rem 0;
    }

    /* Danger zone */
    .danger-zone {
        text-align: center;
        padding: 1.5rem;
        border: 1px solid #3a1a1a;
        border-radius: 12px;
        background: rgba(255, 23, 68, 0.05);
    }

    .danger-title {
        color: #ff1744;
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0 0 0.5rem;
    }

    .danger-text {
        color: #8a8a9a;
        font-size: 0.85rem;
        margin: 0 0 1rem;
    }

    .btn-danger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 2rem;
        font-size: 1rem;
        font-weight: 700;
        color: white;
        background: #ff1744;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s, transform 0.15s, opacity 0.2s;
    }

    .btn-danger:hover:not(:disabled) {
        background: #d50032;
    }

    .btn-danger:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .empty-state {
        text-align: center;
        color: #8a8a9a;
        padding: 2rem 0;
        font-size: 1.1rem;
    }
</style>
