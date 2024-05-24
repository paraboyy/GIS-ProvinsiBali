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
                            <a class="nav-link" aria-current="page" href="/homelogin">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/create">Tambah Ruas Jalan</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="#">Detail Jalan</a>
                        </li>
                    </ul>
                </div>
                <a href="/" class="d-flex align-items-center">
                    <button class="btn btn-danger m-2">Logout</button>
                </a>
            </div>
        </nav>
        <div id="map" style="height: 100vh; width: 100vw;"></div>
    </div>
</template>

<script>
import L from 'leaflet';
import axios from 'axios';
import pako from 'pako';

export default {
    data() {
        return {
            map: null,
            jalanData: [],
            kondisiData: {},
            eksistingData: {},
            jenisJalanData: {}
        };
    },
    mounted() {
        this.initializeMap();
        this.fetchKondisiData();
        this.fetchEksistingData();
        this.fetchJenisJalanData();
    },
    methods: {
        initializeMap() {
            this.map = L.map('map').setView([-8.4253951, 115.1832866], 10);

            this.tileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            }).addTo(this.map);
        },
        async fetchKondisiData() {
            try {
                // Panggil API untuk mendapatkan data kondisi jalan
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mkondisi', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const kondisiData = response.data.eksisting;

                // Konversi array kondisi jalan menjadi objek untuk akses cepat
                kondisiData.forEach(item => {
                    this.kondisiData[item.id] = item.kondisi;
                });

                // Setelah mendapatkan data kondisi, ambil data jalan
                this.fetchJalanData();
            } catch (error) {
                console.error('Gagal mengambil data kondisi jalan:', error);
            }
        },
        async fetchEksistingData() {
            try {
                // Panggil API untuk mendapatkan data eksisting
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/meksisting', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const eksistingData = response.data.eksisting;

                // Konversi array eksisting menjadi objek untuk akses cepat
                eksistingData.forEach(item => {
                    this.eksistingData[item.id] = item.eksisting;
                });
            } catch (error) {
                console.error('Gagal mengambil data eksisting:', error);
            }
        },
        async fetchJenisJalanData() {
            try {
                // Panggil API untuk mendapatkan data jenis jalan
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mjenisjalan', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const jenisJalanData = response.data.eksisting;

                // Konversi array jenis jalan menjadi objek untuk akses cepat
                jenisJalanData.forEach(item => {
                    this.jenisJalanData[item.id] = item.jenisjalan;
                });
            } catch (error) {
                console.error('Gagal mengambil data jenis jalan:', error);
            }
        },
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
                    // Simpan data jalan ke dalam state
                    this.jalanData = jalanData;

                    // Tampilkan data jalan di peta
                    this.displayDataOnMap();
                } else {
                    console.error('Invalid data format:', jalanData);
                }
            } catch (error) {
                console.error('Gagal mengambil data jalan:', error);
            }
        },
        displayDataOnMap() {
            this.layerGroup = L.layerGroup().addTo(this.map);

            this.jalanData.forEach(jalan => {
                try {
                    // Dekompresi koordinat sebelum menambahkan polyline ke peta
                    const decompressedPolyline = this.decompressCoordinate(jalan.paths);

                    // Tentukan warna berdasarkan kondisi jalan
                    const kondisi = this.kondisiData[jalan.kondisi_id];
                    let color = 'blue'; // Default color
                    if (kondisi === 'Rusak') {
                        color = 'red';
                    } else if (kondisi === 'Sedang') {
                        color = 'darkred';
                    } else if (kondisi === 'Baik') {
                        color = 'green';
                    }

                    // Gambar polyline berdasarkan koordinat yang sudah didekompresi
                    const polyline = L.polyline(JSON.parse(decompressedPolyline), { color }).addTo(this.map);

                    // Tambahkan event listener untuk menampilkan popup dengan detail jalan
                    polyline.on('click', () => {
                        const eksisting = this.eksistingData[jalan.eksisting_id] || 'Unknown';
                        const jenisJalan = this.jenisJalanData[jalan.jenisjalan_id] || 'Unknown';

                        polyline.bindPopup(`
                            <strong>Nama Ruas:</strong> ${jalan.nama_ruas}<br>
                            <strong>Kondisi:</strong> ${kondisi}<br>
                            <strong>Lebar:</strong> ${jalan.lebar}<br>
                            <strong>Kode Ruas:</strong> ${jalan.kode_ruas}<br>
                            <strong>Eksisting:</strong> ${eksisting}<br>
                            <strong>Jenis Jalan:</strong> ${jenisJalan}<br>
                            <strong>Keterangan:</strong> ${jalan.keterangan}<br>
                            <strong>Panjang:</strong> ${jalan.panjang}
                        `).openPopup();
                    });
                } catch (error) {
                    console.error('Error parsing coordinate data:', error);
                }
            });
        },
        decompressCoordinate(compressedCoordinate) {
            // Konversi base64 string kembali ke Uint8Array
            const compressed = Uint8Array.from(atob(compressedCoordinate), c => c.charCodeAt(0));

            // Dekompresi koordinat menggunakan pako
            const decompressed = pako.inflate(compressed, { to: 'string' });

            return decompressed;
        },
    }
};
</script>

<style>
#map {
    height: 600px;
}
</style>
