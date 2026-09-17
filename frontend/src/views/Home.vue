<template>
    <body>
        <div class="hero-grid"></div>
        <div class="hero-content">
            <p class="hero-date">14.–15.11.2026 · Ouluhalli</p>
            <h1 class="hero-title">
                <span class="title-main">SIISTI</span>
                <span class="title-sub">LAN 2026</span>
            </h1>
            <p class="hero-desc">Kahden päivän turnaus. Tule pelaamaan tai katselemaan.</p>
            <div class="hero-actions">
                <button class="btn-primary" @click="$router.push('/signup')">
                    Rekisteröidy
                </button>
            </div>
        </div>
    </body>
</template>

<style scoped>
    body {
        background-color: #050508;
        color: #ffffff;
        position: relative;
        min-height: 90vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        overflow: hidden;
    }

    .hero-grid {
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(0, 229, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.04) 1px, transparent 1px);
        background-size: 60px 60px;
        pointer-events: none;
    }

    .hero-content {
        text-align: center;
        position: relative;
        z-index: 1;
        max-width: 600px;
    }

    .hero-date {
        font-size: 1rem;
        font-weight: 600;
        color: #00e5ff;
        margin-bottom: 1.5rem;
    }

    .hero-title {
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

    .hero-desc {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #8a8a9a;
        margin-bottom: 2rem;
    }

    .btn-primary {
        display: inline-flex;
        align-items: center;
        padding: 0.9rem 2rem;
        font-size: 1rem;
        font-weight: 700;
        color: #050508;
        background: #00e5ff;
        border: none;
        border-radius: 8px;
        text-decoration: none;
        cursor: pointer;
        transition:
            background 0.2s,
            transform 0.15s;
    }

    .btn-large {
        padding: 1rem 2.5rem;
        font-size: 1.1rem;
    }
</style>
