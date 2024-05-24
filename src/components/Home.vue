<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <img src="https://www.baliprov.go.id/assets/img/nav_bar.png" alt="Logo" width="30" height="30"
                        class="d-inline-block align-top">
                    GIS || Provinsi Bali
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="#">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/create">Tambah Ruas Jalan</a>
                        </li>
                    </ul>
                </div>
                <a href="/" class="d-flex align-items-center">
                    <button class="btn btn-danger m-2">Logout</button>
                </a>
            </div>
        </nav>

        <div class="card-body" style="height: 780px;">
            <div id="map" ref="map" style="height: 100%;"></div>
        </div>
    </div>
</template>

<script>
import L from 'leaflet';
import axios from 'axios';
import pako from 'pako';

export default {
    mounted() {
        // Inisialisasi peta Leaflet
        this.map = L.map('map').setView([-8.6832467, 115.2095182], 11);

        // Menambahkan layer peta OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        // Panggil API untuk mendapatkan polyline
        this.fetchJalanData();
    },
    methods: {
        async fetchJalanData() {
            try {
                // Panggil API untuk mendapatkan data jalan
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/ruasjalan', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const jalanData = response.data.ruasjalan;

                // Pastikan data yang diterima adalah array
                if (Array.isArray(jalanData)) {
                    // Loop melalui data jalan
                    jalanData.forEach(jalan => {
                        try {
                            // Dekompresi koordinat sebelum menambahkan polyline ke peta
                            const decompressedPolyline = this.decompressCoordinate(jalan.paths);

                            // Gambar polyline berdasarkan koordinat yang sudah didekompresi
                            L.polyline(JSON.parse(decompressedPolyline), { color: 'red' }).addTo(this.map);
                        } catch (error) {
                            console.error('Error parsing coordinate data:', error);
                        }
                    });
                } else {
                    console.error('Invalid data format:', jalanData);
                }
            } catch (error) {
                console.error(error);
            }
        },
        decompressCoordinate(compressedCoordinate) {
            // Konversi base64 string kembali ke Uint8Array
            const compressed = Uint8Array.from(atob(compressedCoordinate), c => c.charCodeAt(0));

            // Dekompresi koordinat menggunakan pako
            const decompressed = pako.inflate(compressed, { to: 'string' });

            return decompressed;
        }
    }
}
</script>

<style>
/* Tambahkan gaya khusus di sini jika diperlukan */
</style>
