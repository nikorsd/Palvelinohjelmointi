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
                        <a class="nav-link" :class="{ active: currentRoute === '/login' }" @click="$router.push('/login')">Kirjaudu sisään</a>
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
    .navbar-brand img {
        border-radius: 20px;
        cursor: pointer;
    }

    .nav-link {
        cursor: pointer;
        transition: font-weight 0.3s ease-in-out;
    }

    .nav-link.active, .dropdown-item.active {
        font-weight: 800 !important;
    }
</style>
