<template>
    <div>
        <div v-if="isWaiting">
            <WaitingPage />
        </div>
        <div v-else class="d-flex justify-content-center align-items-center min-vh-100 bg-light background">
            <div class="glass-effect p-4 rounded shadow-lg w-50 dp-flex">
                <div class="w-50">
                    <h2 class="text-white tx-shadow">Road Tracking - Bali</h2>
                    <span class="text-white tx-shadow">Jelajahi Bali dan laporkan kondisi jalan yang anda lalu dengan
                        Road Tracking</span>
                    <div class="line mt-2 shadow-2"></div>
                    <h2 class="mb-2 mt-4 fs-4 text-dark">Login</h2>
                    <form @submit.prevent="login">
                        <div class="mb-3">
                            <label for="email" class="form-label text-dark">Email</label>
                            <input v-model="email" type="email" id="email" class="form-control shadow-2" required />
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label text-dark">Password</label>
                            <input v-model="password" type="password" id="password" class="form-control shadow-2"
                                required />
                        </div>
                        <button type="submit" class="hvr-green btn-2 btn-info w-100 text-white shadow-2">Login</button>
                        <div class="text-center">
                            <p class="text-white pt-2">Don't have an account? <router-link to="/register"
                                    class="btn-link text-white">Register</router-link></p>
                        </div>
                    </form>
                </div>
                <div class="w-50 justify-content-center">
                    <img :src="imageUrl" alt="Example Image" class="ml-2 wd-90 br-1 shadow-2" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import WaitingPage from './WaitingPage.vue';
import jalan from '@/assets/jalan.jpg';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default {
    components: {
        WaitingPage
    },
    data() {
        return {
            email: '',
            password: '',
            isWaiting: false,
            imageUrl: jalan
        };
    },
    methods: {
        async login() {
            this.isWaiting = true;
            try {
                const response = await axios.post('https://gisapis.manpits.xyz/api/login', {
                    email: this.email,
                    password: this.password,
                });
                const token = response.data.meta.token;
                localStorage.setItem('token', token);
                setTimeout(() => {
                    this.$router.push('/homelogin');
                    this.isWaiting = false;
                }, 2000);
            } catch (error) {
                this.isWaiting = false;
                console.error(error);
                Swal.fire({
                    title: "Login Gagal",
                    text: "Masukan password dan email dengan benar",
                    icon: "error"
                });
            }
        },
    },
};
</script>

<style>
.backgroundimg {
    background-image: url('https://www.unud.ac.id/ac-admin/uploads/img_0744-5235598995.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}
</style>
