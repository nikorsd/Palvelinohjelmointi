import { ref } from 'vue';

export interface UserProfile {
    id: number;
    username: string;
    email: string;
}

const user = ref<UserProfile | null>(null);
const loading = ref(true);

async function fetchMe() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
            user.value = await res.json();
        } else {
            // User deleted or session expired — clear everything
            user.value = null;
            try {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
            } catch { /* ignore */ }
        }
    } catch {
        user.value = null;
    } finally {
        loading.value = false;
    }
}

// Check on first import
fetchMe();

export function useAuth() {
    async function login(email: string, password: string) {
        const res = await fetch('/api/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Kirjautuminen epäonnistui.');
        }
        user.value = data.user;
        return data;
    }

    async function logout() {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch { /* ignore */ }
        user.value = null;
    }

    return { user, loading, fetchMe, login, logout };
}
