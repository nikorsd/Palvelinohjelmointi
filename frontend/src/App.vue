<script setup lang="ts">
    import { ref, onMounted } from 'vue'

    const status = ref<string | null>(null)
    const error = ref<string | null>(null)

    onMounted(async () => {
        try {
            const res = await fetch('http://localhost:3000/api/health')
            const data = await res.json()
            status.value = data.status
        } catch (e) {
            error.value = String(e)
        }
    })
</script>

<template>
    <body>
        <h1>{{ status }}</h1>
        <p v-if="error">Error: {{ error }}</p>
    </body>
</template>

<style scoped></style>
