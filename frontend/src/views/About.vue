<script setup>
    // AI generated
    const games = [
        { name: "Counter-Strike 2", emoji: "🔫" },
        { name: "League of Legends", emoji: "⚔️" },
        { name: "Valorant", emoji: "🎯" },
        { name: "Rocket League", emoji: "🚗" },
        { name: "Minecraft", emoji: "⛏️" },
    ];
</script>

<template>
    <div class="about-page">
        <section class="section games">
            <div class="container">
                <h2 class="section-title">Pelit</h2>
                <div class="games-grid">
                    <div class="game-card" v-for="game in games" :key="game.name">
                        <span class="game-emoji">{{ game.emoji }}</span>
                        <span class="game-name">{{ game.name }}</span>
                    </div>
                </div>
            </div>
        </section>
        <section class="section signup-section">
            <div class="container">
                <h2 class="signup-title">Tervetuloa pelaamaan</h2>
                <p class="signup-desc">Varaa itsellesi paikka turnauksesta.</p>
                <button class="btn-primary btn-large" @click="$router.push('/signup')">Rekisteröidy nyt</button>
            </div>
        </section>
    </div>
</template>

<style>
    @import '../components/styles/Button.css';
</style>

<style scoped>
    .about-page {
        background-color: black;
        color: #FFFFFF;
        min-height: 100vh;
    }

    .section {
        padding: 5rem 2rem;
    }

    .container {
        max-width: 900px;
        margin: 0 auto;
    }

    .section-title {
        font-size: 2rem;
        font-weight: 900;
        margin-bottom: 2rem;
    }

    .games-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
    }

    .game-card {
        border: 1px solid #1a1a2a;
        border-radius: 10px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transition: border-color 0.2s, transform 0.2s;
    }

    .game-emoji {
        font-size: 1.5rem;
    }

    .game-name {
        font-weight: 600;
        font-size: 0.95rem;
    }

    .signup-section {
        text-align: center;
    }

    .signup-title {
        font-size: 2rem;
        font-weight: 900;
        margin-bottom: 0.75rem;
    }

    .signup-desc {
        color: #8a8a9a;
        margin-bottom: 2rem;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }

    @media (max-width: 768px) {
        .section {
            padding: 3.5rem 1.5rem;
        }
    }
</style>
