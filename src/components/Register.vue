<template>
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light background">
        <div class="glass-effect p-4 rounded shadow-lg dp-flex w-50">
            <div class="w-50">
                <h2 class="text-white tx-shadow">Road Tracking - Bali</h2>
                <span class="text-white tx-shadow">Jelajahi Bali dan laporkan kondisi jalan yang anda lalu dengan Road
                    Tracking</span>
                <div class="line mt-2 shadow-2"></div>
                <h2 class="text-dark mb-2 mt-4">Register</h2>
                <form @submit.prevent="register">
                    <div class="mb-3">
                        <label for="name" class="form-label text-dark">Username</label>
                        <input v-model="name" type="text" id="name" class="form-control shadow-2" required />
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label text-dark">Email</label>
                        <input v-model="email" type="email" id="email" class="form-control shadow-2" required />
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label text-dark">Password</label>
                        <input v-model="password" type="password" id="password" class="form-control shadow-2"
                            required />
                    </div>
                    <button type="submit" class="btn btn-info text-white w-100 shadow-2">Register</button>
                    <div class="text-center">
                        <p class="text-white pt-2">Have an account? <router-link to="/"
                                class="btn-link text-white">Login</router-link></p>
                    </div>
                </form>
            </div>
            <div class="w-50 justify-content-center mt-4">
                <img :src="imageUrl" alt="Example Image" class="ml-2 wd-90 br-1 shadow-2" />
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import jalan from '@/assets/jalan.jpg';

export default {
    data() {
        return {
            name: '',
            email: '',
            password: '',
            imageUrl: jalan,
        };
    },
    methods: {
        async register() {
            if (this.name.length < 5) {
                Swal.fire({
                    icon: 'error',
                    title: 'Username Error',
                    text: 'Masukan Username minimal 5 karakter'
                });
                return;
            }
            if (this.password.length < 8 || !/\d/.test(this.password) || !/[!@#$%^&*]/.test(this.password)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Password Error',
                    text: 'Password harus minimal 8 karakter dan memiliki angka dan simbol'
                });
                return;
            }
            try {
                await axios.post('https://gisapis.manpits.xyz/api/register', {
                    name: this.name,
                    email: this.email,
                    password: this.password,
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Registrasi Sukses',
                    text: 'Akun anda telah dibuat, login untuk mengakses web kami'
                });
                this.$router.push('/');
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Registrasi Gagal',
                    text: 'Registrasi gagal, silahkan input ulang data anda'
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
