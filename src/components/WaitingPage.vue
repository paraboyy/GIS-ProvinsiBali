<template>
    <div class="background waiting-page">
        <div class="p-4">
            <img src="https://www.baliprov.go.id/assets/img/nav_bar.png" alt="Logo" class="logo">
            <div class="welcome-text">Welcome to GIS Provinsi Bali</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'WaitingPage'
}
</script>

<style scoped>

.welcome-text {
    margin-top: 20px;
    color: rgb(0, 191, 255);
    font-size: 24px;
    opacity: 0;
    animation: fadeIn 3s forwards;
}
@keyframes fadeIn {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}
</style>
