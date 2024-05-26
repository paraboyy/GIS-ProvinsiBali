<template>
    <div>
        <div v-if="isWaiting">
            <WaitingPage />
        </div>
        <div id="map" ref="map" style="height: 100vh; width: 100vw; position: relative;">
            <div class="map-overlay top-right glass-effect">
                <button class="btn btn-secondary m-2" @click="showLoginModal">Login</button>
                <button class="btn btn-success m-2" @click="showRegisterModal">Register</button>
            </div>
            <div class="map-overlay top-left mx-5 d-flex align-items-center glass-effect">
                <img src="https://www.baliprov.go.id/assets/img/nav_bar.png" alt="Logo" width="50" height="50">
                <p class="fs-5 mt-3 ms-2">GIS || Provinsi Bali</p>
            </div>
        </div>

        <!-- Login Modal -->
        <div v-if="isLoginModalVisible" class="modal-overlay">
            <div class="glass-effect p-3 w-25">
                <span class="close text-danger fs-3" @click="closeLoginModal">&times;</span>
                <h5 class="text-white text-center">Login</h5>
                <form @submit.prevent="handleLogin">
                    <div class="mb-3">
                        <label for="loginEmail" class="form-label text-white">Email</label>
                        <input type="email" class="form-control text-dark" id="loginEmail" v-model="loginEmail">
                    </div>
                    <div class="mb-3">
                        <label for="loginPassword" class="form-label text-white">Password</label>
                        <input type="password" class="form-control text-dark" id="loginPassword"
                            v-model="loginPassword">
                    </div>
                    <button type="submit" class="btn btn-primary">Login</button>
                    <p class="text-white pt-2" @click="showRegisterModal">Don't have an account? Register</p>
                </form>
            </div>
        </div>

        <!-- Register Modal -->
        <div v-if="isRegisterModalVisible" class="modal-overlay">
            <div class="glass-effect p-3 w-25">
                <span class="close text-danger fs-3" @click="closeRegisterModal">&times;</span>
                <h5 class="text-white text-center">Register</h5>
                <form @submit.prevent="handleRegister">
                    <div class="mb-3">
                        <label for="registerName" class="form-label text-white">Name</label>
                        <input type="text" class="form-control text-dark" id="registerName" v-model="registerName">
                    </div>
                    <div class="mb-3">
                        <label for="registerEmail" class="form-label text-white">Email</label>
                        <input type="email" class="form-control text-dark" id="registerEmail" v-model="registerEmail">
                    </div>
                    <div class="mb-3">
                        <label for="registerPassword" class="form-label text-white">Password</label>
                        <input type="password" class="form-control text-dark" id="registerPassword"
                            v-model="registerPassword">
                    </div>
                    <button type="submit" class="btn btn-primary">Register</button>
                    <p class="text-white pt-2" @click="showLoginModal">Have an account? Login</p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import L from 'leaflet';
import WaitingPage from './WaitingPage.vue';

export default {
    components: {
        WaitingPage
    },
    data() {
        return {
            isLoginModalVisible: false,
            isRegisterModalVisible: false,
            loginEmail: '',
            loginPassword: '',
            registerName: '',
            registerEmail: '',
            registerPassword: ''
        };
    },
    mounted() {
        // Inisialisasi peta Leaflet
        this.map = L.map(this.$refs.map).setView([-8.4422091, 115.1723953], 10);

        // Menambahkan layer peta OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
    },
    methods: {
        showLoginModal() {
            this.isLoginModalVisible = true;
            this.isRegisterModalVisible = false;
        },
        closeLoginModal() {
            this.isLoginModalVisible = false;
        },
        showRegisterModal() {
            this.isRegisterModalVisible = true;
            this.isLoginModalVisible = false;
        },
        closeRegisterModal() {
            this.isRegisterModalVisible = false;
        },
        async handleLogin() {
            if (this.validateLogin()) {
                try {
                    const response = await fetch('https://gisapis.manpits.xyz/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: this.loginEmail, password: this.loginPassword })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        localStorage.setItem('token', data.meta.token);
                        this.isWaiting = true;
                        setTimeout(() => {
                            this.$router.push('/homelogin');
                            this.isWaiting = false;
                        }, 2000);
                        this.closeLoginModal();
                    } else {
                        alert(data.message || 'Login failed');
                    }
                } catch (error) {
                    console.error('Error during login:', error);
                }
            }
        },
        async handleRegister() {
            if (this.validateRegister()) {
                try {
                    const response = await fetch('https://gisapis.manpits.xyz/api/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: this.registerName,
                            email: this.registerEmail,
                            password: this.registerPassword
                        })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        this.closeRegisterModal();
                        this.showLoginModal();
                    } else {
                        alert(data.message || 'Registration failed');
                    }
                } catch (error) {
                    console.error('Error during registration:', error);
                }
            }
        },
        validateLogin() {
            if (!this.loginEmail || !this.loginPassword) {
                alert('Please enter both email and password.');
                return false;
            }
            return true;
        },
        validateRegister() {
            if (this.registerName.length < 5) {
                alert('Name must be at least 5 characters long.');
                return false;
            }
            if (!this.registerEmail) {
                alert('Please enter your email.');
                return false;
            }
            if (this.registerPassword.length < 8 || !/\d/.test(this.registerPassword)) {
                alert('Password must be at least 8 characters long and contain at least one number.');
                return false;
            }
            return true;
        }
    }
};
</script>
