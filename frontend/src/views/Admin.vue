<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useAuth, type AdminUser } from '@/composables/auth';
    import '../components/styles/Button.css';

    const { hasRole } = useAuth();

    const users = ref<AdminUser[]>([]);
    const loading = ref(true);
    const error = ref('');

    async function fetchUsers() {
        loading.value = true;
        error.value = '';
        try {
            const res = await fetch('/api/admin/users', {
                credentials: 'include',
            });
            if (!res.ok) {
                const data = await res.json();
                error.value = data.error || 'Unable to fetch users';
                return;
            }
            const data = await res.json();
            users.value = data.users;
        } catch {
            error.value = 'Connection failed';
        } finally {
            loading.value = false;
        }
    }

    onMounted(fetchUsers);
</script>

<template>
    <div class="admin-page">
        <div class="wrapper">
            <div class="header">
                <h1 class="title">Users</h1>
            </div>

            <p v-if="!hasRole('Admin')" class="no-access">
                You cannot do that.
            </p>

            <div v-else>
                <p v-if="error" class="form-error">{{ error }}</p>

                <button class="btn-refresh" @click="fetchUsers" :disabled="loading">
                    {{ loading ? 'Päivitetään...' : 'Päivitä lista' }}
                </button>

                <div v-if="users.length === 0 && !error" class="empty-state">
                    <p>No users</p>
                </div>

                <table v-else class="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Color</th>
                            <th>Role</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in users" :key="u.id">
                            <td>{{ u.id }}</td>
                            <td>{{ u.username }}</td>
                            <td>{{ u.email }}</td>
                            <td>
                                <span class="color-dot" :style="{ backgroundColor: u.profileColor || '#00e5ff' }"></span>
                            </td>
                            <td>
                                <span class="role-badge" :class="u.role.toLowerCase()">
                                    {{ u.role }}
                                </span>
                            </td>
                            <td>{{ new Date(u.created_at).toLocaleDateString('fi-FI') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="footer">
                <a @click="$router.push('/')">← Back</a>
            </p>
        </div>
    </div>
</template>

<style scoped>
    .admin-page {
        background-color: black;
        color: #ffffff;
        min-height: 100vh;
        padding: 3rem 2rem;
        display: flex;
        justify-content: center;
    }

    .wrapper {
        width: 100%;
        max-width: 800px;
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

    .no-access {
        text-align: center;
        color: #ff1744;
        font-weight: 600;
        padding: 2rem 0;
    }

    .btn-refresh {
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
        transition: background 0.2s, border-color 0.2s;
        margin-bottom: 1.5rem;
    }

    .btn-refresh:hover:not(:disabled) {
        background: #2a2a3a;
        border-color: #00e5ff;
    }

    .btn-refresh:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .empty-state {
        text-align: center;
        color: #8a8a9a;
        padding: 2rem 0;
    }

    .user-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 2rem;
    }

    .user-table th,
    .user-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #1a1a2a;
    }

    .user-table th {
        color: #8a8a9a;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .user-table td {
        font-size: 0.95rem;
    }

    .user-table tr:hover td {
        background: rgba(255, 255, 255, 0.02);
    }

    .role-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .role-badge.admin {
        background: rgba(0, 229, 255, 0.15);
        color: #00e5ff;
    }

    .role-badge.user {
        background: rgba(138, 138, 154, 0.15);
        color: #8a8a9a;
    }

    .color-dot {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid #2a2a3a;
    }

    .form-error {
        color: red;
        font-size: 0.85rem;
        text-align: center;
        margin-bottom: 1rem;
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
