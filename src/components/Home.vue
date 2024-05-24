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
                        <li class="nav-item">
                            <a class="nav-link" href="/road">Detail Jalan</a>
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

        <!-- Select boxes -->
        <div class="leaflet-top leaflet-right mt-7">
            <div class="leaflet-control bg-light leaflet-bar p-2">
                <div class="form-group">
                    <label for="mapType">Tipe Peta:</label>
                    <select id="mapType" class="form-select" v-model="selectedMapType" @change="changeMapType">
                        <option value="street">Jalan</option>
                        <option value="satellite">Satelit</option>
                        <option value="terrain">Pemandangan</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="province">Provinsi:</label>
                    <select id="province" class="form-select" v-model="selectedProvince" @change="onProvinceChange">
                        <option value="" disabled selected>Pilih Provinsi</option>
                        <option v-for="province in provinces" :key="province.id" :value="province.id">{{
                            province.provinsi }}</option>
                    </select>
                </div>
                <div class="form-group" v-if="kabupatens.length > 0">
                    <label for="kabupaten">Kabupaten:</label>
                    <select id="kabupaten" class="form-select" v-model="selectedKabupaten" @change="onKabupatenChange">
                        <option value="" disabled selected>Pilih Kabupaten</option>
                        <option v-for="kabupaten in kabupatens" :key="kabupaten.id" :value="kabupaten.id">{{
                            kabupaten.value }}</option>
                    </select>
                </div>
                <div class="form-group" v-if="kecamatans.length > 0">
                    <label for="kecamatan">Kecamatan:</label>
                    <select id="kecamatan" class="form-select" v-model="selectedKecamatan" @change="onKecamatanChange">
                        <option value="" disabled selected>Pilih Kecamatan</option>
                        <option v-for="kecamatan in kecamatans" :key="kecamatan.id" :value="kecamatan.id">{{
                            kecamatan.value }}</option>
                    </select>
                </div>
                <div class="form-group" v-if="desas.length > 0">
                    <label for="desa">Desa:</label>
                    <select id="desa" class="form-select" v-model="selectedDesa" @change="onDesaChange">
                        <option value="" disabled selected>Pilih Desa</option>
                        <option v-for="desa in desas" :key="desa.id" :value="desa.id">{{ desa.value }}</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import L from 'leaflet';
import axios from 'axios';
import pako from 'pako';

export default {
    data() {
        return {
            provinces: [],
            kabupatens: [],
            kecamatans: [],
            desas: [],
            selectedProvince: null,
            selectedKabupaten: null,
            selectedKecamatan: null,
            selectedDesa: null,
            selectedMapType: 'street',
            desaCoordinates: {
                "Jimbaran": [-8.790987, 115.139915], "Benoa": [-8.787573, 115.215521], "Cupel": [-8.3654449, 114.5512443],
                "Ubung": [-8.630591, 115.1964555], "Sanur": [-8.6947883, 115.2492267], "Kesiman": [-8.6599448, 115.2487942],
                "Tista": [-8.5426194, 115.0702486],
                "Babakan": [-8.3909595, 115.1284769],
                // Tambahkan koordinat desa lainnya di sini
            }
        };
    },
    mounted() {
        // Inisialisasi peta Leaflet
        this.map = L.map('map').setView([-8.6832467, 115.2095182], 11);

        // Menambahkan layer peta OpenStreetMap
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        // Panggil API untuk mendapatkan polyline
        this.fetchJalanData();
        this.fetchProvinces();
    },
    methods: {
        async fetchProvinces() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mregion', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.provinces = response.data.provinsi;
            } catch (error) {
                console.error(error);
            }
        },
        async fetchKabupaten() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://gisapis.manpits.xyz/api/kabupaten/${this.selectedProvince}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.kabupatens = response.data.kabupaten;
                this.kecamatans = [];
                this.desas = [];
            } catch (error) {
                console.error(error);
            }
        },
        async fetchKecamatan() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://gisapis.manpits.xyz/api/kecamatan/${this.selectedKabupaten}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.kecamatans = response.data.kecamatan;
                this.desas = [];
            } catch (error) {
                console.error(error);
            }
        },
        async fetchDesa() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://gisapis.manpits.xyz/api/desa/${this.selectedKecamatan}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.desas = response.data.desa;
            } catch (error) {
                console.error(error);
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
        async changeMapType() {
            // Hapus layer peta yang ada
            this.map.removeLayer(this.tileLayer);

            // Tambahkan kembali layer peta sesuai dengan tipe peta yang dipilih
            switch (this.selectedMapType) {
                case 'street':
                    this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }).addTo(this.map);
                    break;
                case 'satellite':
                    this.tileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                        maxZoom: 19,
                        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                    }).addTo(this.map);
                    break;
                case 'terrain':
                    this.tileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                        maxZoom: 17,
                        attribution: '&copy; <a href="http://opentopomap.org/about">OpenTopoMap</a> contributors'
                    }).addTo(this.map);
                    break;
                default:
                    break;
            }
        },
        decompressCoordinate(compressedCoordinate) {
            // Konversi base64 string kembali ke Uint8Array
            const compressed = Uint8Array.from(atob(compressedCoordinate), c => c.charCodeAt(0));

            // Dekompresi koordinat menggunakan pako
            const decompressed = pako.inflate(compressed, { to: 'string' });

            return decompressed;
        },
        onProvinceChange() {
            this.fetchKabupaten();
            this.selectedKabupaten = null;
            this.selectedKecamatan = null;
            this.selectedDesa = null;
        },
        onKabupatenChange() {
            this.fetchKecamatan();
            this.selectedKecamatan = null;
            this.selectedDesa = null;
        },
        onKecamatanChange() {
            this.fetchDesa();
            this.selectedDesa = null;
        },
        onDesaChange() {
            this.setMapViewForDesa();
        },
        setMapViewForDesa() {
            const desa = this.desas.find(d => d.id === this.selectedDesa);
            if (desa && this.desaCoordinates[desa.value]) {
                const [lat, lng] = this.desaCoordinates[desa.value];
                this.map.setView([lat, lng], 14);
            }
        }
    }
}
</script>
