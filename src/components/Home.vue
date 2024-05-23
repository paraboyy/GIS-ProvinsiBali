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
                            <a class="nav-link active" aria-current="page" href="#">Ruas Jalan</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/dataruasjalan">Tambah Ruas Jalan</a>
                        </li>
                    </ul>
                </div>
                <a href="/" class="d-flex align-items-center">
                    <button class="btn btn-danger m-2">Logout</button>
                </a>
            </div>
        </nav>

        <div class="card shadow mx-2">
            <div class="card-body" style="height: 800px;">
                <div id="map" ref="map" style="height: 100%;"></div>
            </div>
        </div>
    </div>
</template>

<script>
import L from 'leaflet';
import sha256 from 'crypto-js/sha256';

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
        this.fetchPolyline();
    },
    methods: {
        fetchPolyline() {            
            fetch('https://gisapis.manpits.xyz/api/ruasjalan', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token') 
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    if (data && data.ruasjalan) {
                        data.ruasjalan.forEach(ruas => {
                            const decryptedPolyline = this.decryptPolyline(ruas.paths);
                            this.drawPolyline(decryptedPolyline);
                        });
                    } else {
                        throw new Error('Ruas jalan data is empty or undefined');
                    }
                })
                .catch(error => {
                    console.error('Error fetching polyline:', error);
                });
            
        },
        decryptPolyline(polyline) {            
            const decryptedPolyline = polyline.map(coord => {
                const decryptedCoord = sha256(coord).toString();
                return JSON.parse(decryptedCoord);
            });
            return decryptedPolyline;
            
        },
        drawPolyline(polyline) {
            // Gambar polyline di peta menggunakan Leaflet
            L.polyline(polyline, { color: 'red' }).addTo(this.map);
        }
    }
}
</script>

<style>
/* Tambahkan gaya khusus di sini jika diperlukan */
</style>
