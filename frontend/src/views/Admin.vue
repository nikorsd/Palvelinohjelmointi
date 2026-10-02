<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useAuth, type AdminUser } from '@/composables/auth';
    import UserEditor from '@/components/UserEditor.vue';
    import ContactViewer from '@/components/ContactViewer.vue';
    import '../components/styles/Button.css';

    const { hasRole } = useAuth();

    interface Contact {
        id: number
        subject: string
        email: string
        message: string
        created_at: string
    }

    const users = ref<AdminUser[]>([]);
    const contacts = ref<Contact[]>([]);
    const loading = ref(true);
    const error = ref('');
    const selectedUser = ref<AdminUser | null>(null)
    const togglingUserId = ref<number | null>(null)
    const activeTab = ref<'users' | 'contacts'>('users')
    const selectedContact = ref<Contact | null>(null)

    async function toggleParticipate(userId: number) {
        if (togglingUserId.value) return
        togglingUserId.value = userId
        try {
            const res = await fetch(`/api/admin/participate/${userId}`, {
                method: 'POST',
                credentials: 'include',
            })
            if (!res.ok) {
                const data = await res.json()
                error.value = data.error || 'Tarkistus epäonnistui'
                return
            }
            await fetchUsers()
        } catch {
            error.value = 'Yhteys epäonnistui'
        } finally {
            togglingUserId.value = null
        }
    }

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

    async function fetchContacts() {
        loading.value = true;
        error.value = '';
        try {
            const res = await fetch('/api/admin/contacts', {
                credentials: 'include',
            });
            if (!res.ok) {
                const data = await res.json();
                error.value = data.error || 'Unable to fetch contacts';
                return;
            }
            const data = await res.json();
            contacts.value = data.contacts || [];
        } catch {
            error.value = 'Connection failed';
        } finally {
            loading.value = false;
        }
    }

    onMounted(fetchUsers);
    onMounted(fetchContacts);
</script>

<template>
    <div class="admin-page">
        <div class="wrapper">
            <div class="header">
                <h1 class="title">Käyttäjät</h1>
            </div>

            <p v-if="!hasRole('Admin')" class="no-access">
                Et voi tehdä noin.
            </p>

            <div v-else>
                <p v-if="error" class="form-error">{{ error }}</p>

                <div class="tab-bar">
                    <button
                        class="tab-btn"
                        :class="{ active: activeTab === 'users' }"
                        @click="activeTab = 'users'"
                    >
                        Käyttäjät
                    </button>
                    <button
                        class="tab-btn"
                        :class="{ active: activeTab === 'contacts' }"
                        @click="activeTab = 'contacts'"
                    >
                        Yhteydenotot
                    </button>
                </div>

                <button class="btn-refresh" @click="activeTab === 'users' ? fetchUsers() : fetchContacts()" :disabled="loading">
                    {{ loading ? 'Päivitetään...' : 'Päivitä lista' }}
                </button>

                <div v-if="activeTab === 'users'" class="tab-content">
                    <div v-if="users.length === 0 && !error" class="empty-state">
                        <p>Ei käyttäjiä</p>
                    </div>

                    <table v-else class="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Käyttäjänimi</th>
                            <th>Sähköposti</th>
                            <th>Väri</th>
                            <th>Rooli</th>
                            <th>Ilmottautunut</th>
                            <th>Luotu</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr @click="selectedUser = u" class="user-entry" v-for="u in users" :key="u.id">
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
                            <td>
                                <button
                                    class="btn-toggle"
                                    :class="{ active: u.participated }"
                                    :disabled="togglingUserId === u.id"
                                    @click.stop="toggleParticipate(u.id)"
                                >
                                    {{ u.participated ? 'Kyllä' : 'Ei' }}
                                </button>
                            </td>
                            <td>{{ new Date(u.created_at).toLocaleDateString('fi-FI') }}</td>
                        </tr>
                    </tbody>
                </table>
                </div>

                <div v-if="activeTab === 'contacts'" class="tab-content">
                    <div v-if="contacts.length === 0 && !error" class="empty-state">
                        <p>Ei yhteydenottoja</p>
                    </div>

                    <table v-else class="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>AIHE</th>
                                <th>Sähköposti</th>
                                <th>Viesti</th>
                                <th>Lähetetty</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="c in contacts" :key="c.id" class="contact-row" @click="selectedContact = c; selectedUser = null">
                                <td>{{ c.id }}</td>
                                <td>{{ c.subject }}</td>
                                <td>{{ c.email }}</td>
                                <td class="message-cell">{{ c.message }}</td>
                                <td>{{ new Date(c.created_at).toLocaleDateString('fi-FI') }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <p class="footer">
                <a @click="$router.push('/')">← Takaisin</a>
            </p>

            <UserEditor :user="selectedUser" @updated="fetchUsers" @deleted="fetchUsers"></UserEditor>
            <ContactViewer :contact="selectedContact" @closed="selectedContact = null"></ContactViewer>
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
        border-radius: 2px;
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

    .user-entry {
        cursor: pointer;
    }

    .user-entry:hover {
        background-color: rgb(10,10,10);
    }

    .btn-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.3rem 0.8rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: white;
        background: #2a2a3a;
        border: 1px solid #3a3a4a;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
    }

    .btn-toggle:hover:not(:disabled) {
        background: #3a3a4a;
        border-color: #00e5ff;
    }

    .btn-toggle.active {
        background: rgba(0, 229, 255, 0.15);
        border-color: #00e5ff;
        color: #00e5ff;
    }

    .btn-toggle:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .tab-bar {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .tab-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1.25rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: #8a8a9a;
        background: #1a1a2a;
        border: 1px solid #2a2a3a;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s, color 0.2s;
    }

    .tab-btn:hover {
        background: #2a2a3a;
        border-color: #00e5ff;
        color: white;
    }

    .tab-btn.active {
        background: rgba(0, 229, 255, 0.15);
        border-color: #00e5ff;
        color: #00e5ff;
    }

    .tab-content {
        margin-bottom: 2rem;
    }

    .message-cell {
        max-width: 300px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .contact-row {
        cursor: pointer;
    }

    .contact-row:hover td {
        background: rgba(0, 229, 255, 0.05);
    }
</style>
