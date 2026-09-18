<template>
    <!-- Snippet from Bootstrap's templates -->
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <a class="navbar-brand" @click="$router.push('/')">
                <img src="../assets/logo_ai.webp" alt="Bootstrap" height="50">
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" :class="{ active: currentRoute === '/' }" @click="$router.push('/')">Etusivu</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" :class="{ active: currentRoute === '/about' }" @click="$router.push('/about')">Lisätietoja</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" :class="{ active: currentRoute === '/signup' }" @click="$router.push('/signup')">Rekisteröidy</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" :class="{ active: currentRoute === '/contact' }" @click="$router.push('/contact')">Ota yhteyttä</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script setup>
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';

    const route = useRoute();
    const currentRoute = computed(() => route.path);
</script>

<style scoped>
    .navbar {
        background-color: rgba(5, 5, 8, 0.9) !important;
        border-bottom: 1px solid #1a1a2a;
    }

    .navbar-brand {
        color: #ffffff !important;
    }

    .navbar-brand img {
        border-radius: 10px;
        cursor: pointer;
    }

    .navbar-toggler {
        border-color: #1a1a2a !important;
    }

    .navbar-toggler-icon {
        /* Made by AI */
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.8)' stroke-linecap='round' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
    }

    .nav-link {
        cursor: pointer;
        color: #8a8a9a !important;
        transition: color 0.2s, font-weight 0.2s;
    }

    .nav-link:hover,
    .nav-link:focus {
        color: #ffffff !important;
    }

    .nav-link.active,
    .dropdown-item.active {
        color: #00e5ff !important;
        font-weight: 700;
    }
</style>
