import { computed } from 'vue';
import { user } from './auth';

/**
 * Returns the user's profile color from the server,
 * falling back to localStorage, then a default cyan.
 * Written by AI
 */
export function useProfileColor() {
    return computed(() => {
        if (user.value?.profileColor) {
            return user.value.profileColor;
        }
        const saved = localStorage.getItem('profileColor');
        if (saved) {
            return saved;
        }
        return '#00e5ff';
    });
}
