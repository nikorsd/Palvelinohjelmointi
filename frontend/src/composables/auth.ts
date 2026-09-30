import { ref } from 'vue';

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    role?: string;
    profileColor?: string | null;
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    role: string;
    profileColor?: string | null;
    created_at: string;
}

export const user = ref<UserProfile | null>(null);
const loading = ref(true);

export function hasRole(role: string): boolean {
    return user.value?.role === role;
}

export function hasAnyRole(...roles: string[]): boolean {
    return roles.includes(user.value?.role ?? '');
}

async function fetchMe() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
            user.value = await res.json();
            console.debug(user)
        } else {
            // User deleted or session expired
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

    return { user, loading, fetchMe, login, logout, hasRole, hasAnyRole };
}
