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
                            <a class="nav-link active" href="#">Tambah Ruas Jalan</a>
                        </li>
                    </ul>
                </div>
                <a href="/" class="d-flex align-items-center">
                    <button class="btn btn-danger m-2">Logout</button>
                </a>
            </div>
        </nav>

        <div class="d-flex background p-2">
            <div class="card shadow mx-2" style="width: 100%;">
                <div class="card-body">
                    <div id="map" ref="map" style="height: 100%; width: 100%;"></div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card shadow mx-2">
                    <div class="card-body">
                        <form @submit.prevent="tambahJalan">
                            <div class="mb-3">
                                <label for="province" class="form-label">Pilih Provinsi:</label>
                                <select id="province" class="form-select" v-model="selectedProvince"
                                    @change="onProvinceChange">
                                    <option v-for="province in provinces" :key="province.id" :value="province.id">
                                        {{ province.provinsi }}
                                    </option>
                                </select>
                            </div>
                            <div v-if="kabupatens.length" class="mb-3">
                                <label for="kabupaten" class="form-label">Pilih Kabupaten:</label>
                                <select id="kabupaten" class="form-select" v-model="selectedKabupaten"
                                    @change="onKabupatenChange">
                                    <option v-for="kabupaten in kabupatens" :key="kabupaten.id" :value="kabupaten.id">
                                        {{ kabupaten.value }}
                                    </option>
                                </select>
                            </div>
                            <div v-if="kecamatans.length" class="mb-3">
                                <label for="kecamatan" class="form-label">Pilih Kecamatan:</label>
                                <select id="kecamatan" class="form-select" v-model="selectedKecamatan"
                                    @change="onKecamatanChange">
                                    <option v-for="kecamatan in kecamatans" :key="kecamatan.id" :value="kecamatan.id">
                                        {{ kecamatan.value }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="desa">Nama Desa:</label>
                                <select id="desa" class="form-select" v-model="selectedDesa" @change="onDesaChange">
                                    <option v-for="desa in desas" :key="desa.id" :value="desa.id">
                                        {{ desa.value }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="nama_ruas">Nama Ruas:</label>
                                <input type="text" class="form-control" v-model="jalanForm.nama_ruas" required>
                            </div>
                            <div class="form-group">
                                <label for="lebar">Lebar Ruas:</label>
                                <input type="text" class="form-control" v-model="jalanForm.lebar" required>
                            </div>
                            <div class="form-group">
                                <label for="kode_ruas">Kode Ruas:</label>
                                <input type="text" class="form-control" v-model="jalanForm.kode_ruas" required>
                            </div>
                            <div class="form-group">
                                <label for="eksisting">Eksisting:</label>
                                <select id="eksisting" class="form-select" v-model="selectedEksisting"
                                    @change="onEksistingChange">
                                    <option v-for="eksisting in eksistings" :key="eksisting.id" :value="eksisting.id">
                                        {{ eksisting.eksisting }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="kondisi">Kondisi:</label>
                                <select id="kondisi" class="form-select" v-model="selectedKondisi"
                                    @change="onKondisiChange">
                                    <option v-for="kondisi in kondisis" :key="kondisi.id" :value="kondisi.id">
                                        {{ kondisi.kondisi }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="jenis_jalan">Jenis Jalan:</label>
                                <select id="jenis_jalan" class="form-select" v-model="selectedJenisJalan"
                                    @change="onJenisJalanChange">
                                    <option v-for="jenis_jalan in jenisJalans" :key="jenis_jalan.id"
                                        :value="jenis_jalan.id">
                                        {{ jenis_jalan.jenisjalan }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="keterangan">Keterangan:</label>
                                <input type="text" class="form-control" v-model="jalanForm.keterangan" required>
                            </div>
                            <button type="submit" class="btn btn-primary mt-4">Tambah Jalan</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import L from 'leaflet';
import pako from 'pako';

export default {
    data() {
        return {
            jalanForm: {
                desa_id: '',
                kode_ruas: '',
                nama_ruas: '',
                panjang: '',
                lebar: '',
                eksisting_id: '',
                kondisi_id: '',
                jenisjalan_id: '',
                keterangan: '',
            },
            desas: [],
            eksistings: [],
            kondisis: [],
            jenisJalans: [],
            selectedDesa: null,
            selectedEksisting: null,
            selectedKondisi: null,
            selectedJenisJalan: null,
            polyline: null,
            polylineCoords: [],
            polylineString: '',
            provinces: [],
            kabupatens: [],
            kecamatans: [],
            selectedProvince: null,
            selectedKabupaten: null,
            selectedKecamatan: null,
            desaCoordinates: {
                "Jimbaran": [-8.790987, 115.139915],
                "Benoa": [-8.787573, 115.215521],
                "Cupel": [-8.3654449, 114.5512443],
                // Tambahkan koordinat desa 
            }
        }
    },

    mounted() {
        // Inisialisasi peta Leaflet
        this.map = L.map('map').setView([-8.4253951, 115.1832866], 10);

        // Menambahkan layer peta OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        // Menangani event klik pada peta untuk menggambar polyline
        this.map.on('click', this.onMapClick);

        this.fetchJalanData();
    },

    created() {
        this.fetchEksistings();
        this.fetchKondisis();
        this.fetchJenisJalans();
        this.fetchProvinces();
    },

    methods: {
        async fetchEksistings() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/meksisting', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.eksistings = response.data.eksisting;
            } catch (error) {
                console.error(error);
            }
        },
        async fetchKondisis() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mkondisi', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.kondisis = response.data.eksisting;
            } catch (error) {
                console.error(error);
            }
        },
        async fetchJenisJalans() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mjenisjalan', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.jenisJalans = response.data.eksisting;
            } catch (error) {
                console.error(error);
            }
        },
        setMapViewForDesa() {
            const selectedDesaName = this.desas.find(desa => desa.id === this.selectedDesa).value;

            if (selectedDesaName in this.desaCoordinates) {
                const coords = this.desaCoordinates[selectedDesaName];
                this.map.setView(coords, 15); // Atur zoom level sesuai kebutuhan
            } else {
                console.error('Koordinat untuk desa ini tidak tersedia.');
            }
        },
        onDesaChange() {
            this.setMapViewForDesa();
        },
        onEksistingChange() {
            this.fetchEksistings();
        },
        onKondisiChange() {
            this.fetchKondisis();
        },
        onJenisJalanChange() {
            this.fetchJenisJalans();
        },
        onMapClick(e) {
            // Tambahkan titik klik ke polylineCoords
            this.polylineCoords.push(e.latlng);

            // Jika polyline sudah ada, hapus polyline tersebut
            if (this.polyline) {
                this.map.removeLayer(this.polyline);
            }

            // Gambar polyline baru
            this.polyline = L.polyline(this.polylineCoords, { color: 'red' }).addTo(this.map);

            // Hitung panjang polyline
            this.jalanForm.panjang = this.calculatePolylineLength(this.polylineCoords);

            // Konversi polyline menjadi string
            this.polylineString = JSON.stringify(this.polylineCoords);

        },
        calculatePolylineLength(coords) {
            let length = 0;
            for (let i = 0; i < coords.length - 1; i++) {
                length += coords[i].distanceTo(coords[i + 1]);
            }
            return length.toFixed(2); // Panjang dalam meter dengan 2 angka desimal
        },
        async tambahJalan() {
            // Logika untuk menambah jalan ke database
            try {
                // Kompresi koordinat sebelum dikirim ke server
                const compressedPolyline = this.compressCoordinate(this.polylineString);

                const token = localStorage.getItem('token');
                const response = await axios.post('https://gisapis.manpits.xyz/api/ruasjalan', {
                    desa_id: this.selectedDesa,
                    nama_ruas: this.jalanForm.nama_ruas,
                    lebar: this.jalanForm.lebar,
                    kode_ruas: this.jalanForm.kode_ruas,
                    eksisting_id: this.selectedEksisting,
                    kondisi_id: this.selectedKondisi,
                    jenisjalan_id: this.selectedJenisJalan,
                    keterangan: this.jalanForm.keterangan,
                    panjang: this.jalanForm.panjang,
                    paths: compressedPolyline,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log(response.data);
                alert('Jalan berhasil ditambahkan');
            } catch (error) {
                console.error(error);
                alert('Gagal menambahkan jalan');
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
        compressCoordinate(coordinateString) {
            // Konversi koordinat string menjadi Uint8Array
            const uint8Array = new TextEncoder().encode(coordinateString);

            // Kompresi koordinat menggunakan pako
            const compressed = pako.deflate(uint8Array);

            // Konversi hasil kompresi menjadi base64 string
            return btoa(String.fromCharCode(...new Uint8Array(compressed)));
        },
        decompressCoordinate(compressedCoordinate) {
            // Konversi base64 string kembali ke Uint8Array
            const compressed = Uint8Array.from(atob(compressedCoordinate), c => c.charCodeAt(0));

            // Dekompresi koordinat menggunakan pako
            const decompressed = pako.inflate(compressed, { to: 'string' });

            return decompressed;
        },
        async fetchProvinces() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mregion', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.provinces = response.data.provinsi;
                this.kabupatens = response.data.kabupaten;
                this.kecamatans = response.data.kecamatan;
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
        onProvinceChange() {
            this.fetchKabupaten();
        },
        onKabupatenChange() {
            this.fetchKecamatan();
        },
        onKecamatanChange() {
            this.fetchDesa();
        }
    }
}
</script>

<style>
/* Tambahkan gaya kustom Anda di sini */
</style>
