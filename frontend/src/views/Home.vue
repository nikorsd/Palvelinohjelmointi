<template>
    <div class="home-page">
        <div class="content">
            <p class="date">14.–15.11.2026 - Ouluhalli</p>
            <h1 class="title">
                <span class="title-main">SIISTIT</span>
                <span class="title-sub">LANIT 2026</span>
            </h1>
            <p class="desc">Kahden päivän turnaus. Tule pelaamaan tai katselemaan.</p>
            <div class="actions">
                <button class="btn-primary" @click="$router.push('/signup')">
                    Rekisteröidy
                </button>
            </div>
        </div>
    </div>
</template>

<style>
    @import '../components/styles/Button.css';
</style>

<style scoped>
    .home-page {
        background-color: black;
        color: #ffffff;
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        overflow: hidden;
    }

    .grid {
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(0, 229, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.04) 1px, transparent 1px);
        background-size: 60px 60px;
        pointer-events: none;
    }

    .content {
        text-align: center;
        position: relative;
        z-index: 1;
        max-width: 600px;
    }

    .date {
        font-size: 1rem;
        font-weight: 600;
        color: #00e5ff;
        margin-bottom: 1.5rem;
    }

    .title {
        font-size: clamp(3.5rem, 10vw, 7rem);
        font-weight: 900;
        line-height: 1;
        letter-spacing: -0.03em;
        margin: 0 0 1.5rem;
    }

    .title-main {
        display: block;
    }

    .title-sub {
        display: block;
        color: #ffffff;
    }

    .desc {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #8a8a9a;
        margin-bottom: 2rem;
    }
</style>
