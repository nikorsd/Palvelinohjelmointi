<template>
    <footer>
        <div class="brand">
            <span class="logo">SIISTIT LANIT</span>
            <p class="date">Ouluhalli - 14.–15.11.2026</p>
        </div>
        <nav class="links">
            <a @click="$router.push('/')">Etusivu</a>
            <a @click="$router.push('/about')">Lisätietoja</a>
            <a @click="$router.push('/signup')">Rekisteröidy</a>
        </nav>
    </footer>
</template>

<style scoped>
    footer {
        background-color: black;
        padding: 3rem 2rem;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        text-align: center;
    }

    .brand {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
    }

    .logo {
        font-size: 1.1rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        color: #ffffff;
    }

    .date {
        font-size: 0.85rem;
        color: #00e5ff;
        font-weight: 600;
        margin: 0;
    }

    .links {
        color: gray;
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    @media (max-width: 768px) {
        footer {
            padding: 2.5rem 1.5rem;
        }

        .links {
            gap: 1.25rem;
        }
    }
</style>
