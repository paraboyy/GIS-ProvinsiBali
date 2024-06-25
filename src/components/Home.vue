<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="#">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/create">Tambah Ruas Jalan</a>
                        </li>
                        <!-- <li class="nav-item">
                            <a class="nav-link" href="/road">Detail Jalan</a>
                        </li> -->
                        <li class="nav-item">
                            <a class="nav-link" href="/data">Data Jalan</a>
                        </li>
                    </ul>
                    <button class="btn btn-danger m-2 shadow-2"><a href="/"
                            class="d-flex text-white align-items-center">Logout</a></button>
                </div>
                <div class="dropdown mx-3">
                    <button class="btn btn-primary dropdown-toggle shadow-2" type="button" id="dropdownKondisi"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Kondisi Jalan
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownKondisi">
                        <li><a class="dropdown-item" href="#" @click="filterByCondition('Baik')">Baik</a></li>
                        <li><a class="dropdown-item" href="#" @click="filterByCondition('Sedang')">Sedang</a></li>
                        <li><a class="dropdown-item" href="#" @click="filterByCondition('Rusak')">Rusak</a></li>
                    </ul>
                </div>

                <div class="dropdown mx-3">
                    <button class="btn btn-primary dropdown-toggle shadow-2" type="button" id="dropdownJenis"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Jenis Jalan
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownJenis">
                        <li><a class="dropdown-item" href="#" @click="filterByRoadType('Desa')">Desa</a></li>
                        <li><a class="dropdown-item" href="#" @click="filterByRoadType('Kabupaten')">Kabupaten</a></li>
                        <li><a class="dropdown-item" href="#" @click="filterByRoadType('Provinsi')">Provinsi</a></li>
                    </ul>
                </div>
                <a class="navbar-brand" href="#">
                    <img src="https://www.baliprov.go.id/assets/img/nav_bar.png" alt="Logo" width="30" height="30"
                        class="d-inline-block align-top">
                    GIS || Provinsi Bali
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
                <div class="form-group mt-2">
                    <input type="text" class="form-control me-2" placeholder="Cari ruas" v-model="searchQuery">
                    <button class="btn btn-outline-success mt-2" @click="searchByName">Cari</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import L from 'leaflet';
import axios from 'axios';
import pako from 'pako';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default {
    data() {
        return {
            labelMarker: [],
            isNavbarVisible: false,
            provinces: [],
            kabupatens: [],
            kecamatans: [],
            desas: [],
            desafull: [],
            jalanData: [],
            searchQuery: '',
            selectedProvince: null,
            selectedKabupaten: null,
            selectedKecamatan: null,
            selectedDesa: null,
            selectedMapType: 'street',
            kondisiData: {},
            eksistingData: {},
            jenisJalanData: {},
            desaCoordinates: {
                "Jimbaran": [-8.7882083, 115.1525732], "Benoa": [-8.787573, 115.215521], "Cupel": [-8.3654449, 114.5512443],
                "Ubung": [-8.630591, 115.1964555], "Sanur": [-8.6947883, 115.2492267], "Kesiman": [-8.6599448, 115.2487942],
                "Tista": [-8.5426194, 115.0702486], "Babakan": [-8.3909595, 115.1284769], "Pecatu": [-8.8193125, 115.1096054],
                "Ungasan": [-8.8238493, 115.155516], "Legian": [-8.703179, 115.170034], "Seminyak": [-8.6884617, 115.1607311],
                "Kedonganan": [-8.7601338, 115.1734532], "Tuban": [-8.7418107, 115.1747874],
                "Kuta": [-8.7251247, 115.1783948], "Besakih": [-8.3674573, 115.4491766], "Pesaban": [-8.4732323, 115.3933014],
                "Pesabah": [-8.4732323, 115.3933014], "Ababi": [-8.4094819, 115.5701309], "Ababi": [-8.4094819, 115.5701309],
                "Culik": [-8.3423049, 115.6031107], "Talibeng": [-8.5015434, 115.4267757], "Lokasari": [-8.5099149, 115.4192988],
                "Lokasari": [-8.5099149, 115.4192988], "Kesiman": [-8.6599448, 115.2487942], "Kesiman Pentilan": [-8.6599448, 115.2487942],
                "Dangin Puri Kelod": [-8.6599448, 115.2491014],
                "Bayung Cerik": [-8.3058562, 115.2825459],
                "Bayung Cerik": [-8.3058562, 115.2825459],
                "Tonja": [-8.6341272, 115.2231676],
                // Tambahkan koordinat desa lainnya di sini
            },
            kecematanCoordinates: {
                "MENGWI": [-8.5607121, 115.1446241], "KUTA UTARA": [-8.6454091, 115.159901], "ABIANSEMAL": [-8.5272669, 115.2151078],
                "PETANG": [-8.3500797, 115.2252437], "KUTA": [-8.7242124, 115.1815534], "KUTA SELATAN": [-8.7806564, 115.1886018],
                "DENPASAR SELATAN": [-8.6888763, 115.2231738], "DENPASAR UTARA": [-8.623538, 115.2057948], "DENPASAR TIMUR": [-8.6304535, 115.2471368],
                "DENPASAR BARAT": [-8.6590235, 115.1898615], "KERAMBITAN": [-8.5230725, 115.0846588], "PENEBEL": [-8.4278098, 115.1467919],
                "SELEMADEG": [-8.4908353, 115.0491421], "BATURITI": [-8.3401193, 115.1504053], "KEDIRI": [-8.571807, 115.1188969],
                "PUPUAN": [-8.3541709, 114.9957841], "MARGA": [-8.4429303, 115.1794938], "NEGARA": [-8.298738, 114.5979531],
                "JEMBRANA": [-8.3012707, 114.6673136], "MENDOYO": [-8.2996525, 114.7390452], "PEKUTATAN": [-8.3873785, 114.8566339],
                "MELAYA": [-8.2274723, 114.5344651], "GEROKGAK": [-8.1882967, 114.7639236], "SUKASADA": [-8.2088404, 115.0909638],
                "TEJAKULA": [-8.1317751, 115.3248397], "SERIRIT": [-8.249942, 114.8922708], "BULELENG": [-8.129198, 115.0836545],
                "BUSUNG BIU": [-8.3012064, 114.9320468], "SAWAN": [-8.151514, 115.1642467], "KUBUTAMBAHAN": [-8.1574336, 115.21734],
                "TAMPAKSIRING": [-8.45527, 115.307778], "UBUD": [-8.5123037, 115.2512905], "BLAHBATUH": [-8.5653966, 115.3044604],
                "GIANYAR": [-8.5197936, 115.3269249], "PAYANGAN": [-8.4026552, 115.2332244], "BANJAR": [-8.2188753, 115.0095564],
                "SUKAWATI": [-8.5823404, 115.2585505], "TEGALLALANG": [-8.3981217, 115.2710165], "SUSUT": [-8.4226661, 115.330208],
                "BANGLI": [-8.4130735, 115.348215], "TEMBUKU": [-8.414887, 115.376498], "KINTAMANI": [-8.2401583, 115.3239536],
                "TABANAN": [-8.5229527, 115.0921335], "SELEMADEG TIMUR": [-8.4847379, 115.041563], "SELEMADEG BARAT": [-8.4544564, 114.9445345],
                "NUSA PENIDA": [-8.7421655, 115.4810546], "BANJARANGKAN": [-8.514859, 115.3520453], "KLUNGKUNG": [-8.5253094, 115.3964945],
                "DAWAN": [-8.5376968, 115.4196395], "RENDANG": [-8.3775125, 115.3817173], "ABANG": [-8.3775125, 115.3817173],
                "SIDEMEN": [-8.3775125, 115.3817173], "BEBANDEM": [-8.3775125, 115.3817173], "MANGGIS": [-8.3775125, 115.3817173],
                "SELAT": [-8.3775125, 115.3817173], "KARANGASEM": [-8.3775125, 115.3817173], "KUBU": [-8.3775125, 115.3817173],
            },
            kabupatenCoordinates: {
                "Jembrana": [-8.3647542, 114.5667299], "Tabanan": [-8.4082848, 115.0193258], "Badung": [-8.5371681, 115.0506975],
                "Denpasar": [-8.6633288, 115.1981492], "Buleleng": [-8.2131465, 114.7912249], "Klungkung": [-8.6271477, 115.4096299],
                "Gianyar": [-8.4680218, 115.2189621], "Bangli": [-8.3387217, 115.2969328], "Karangasem": [-8.3729366, 115.4719545],
            }
        };
    },
    mounted() {
        // Inisialisasi peta Leaflet
        this.map = L.map(this.$refs.map).setView([-8.4422091, 115.1723953], 10);

        // Menambahkan layer peta OpenStreetMap
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        // Panggil API untuk mendapatkan polyline
        this.fetchJalanData();
        this.fetchProvinces();
        this.fetchKondisiData();
        this.fetchEksistingData();
        this.fetchJenisJalanData();
    },
    methods: {
        removeLabelMarker() {
            this.labelMarkers.forEach(marker => {
                this.map.removeLayer(marker); // Menghapus marker dari peta
            });
            this.labelMarkers = []; // Kosongkan array marker setelah dihapus semua
        },
        filterByCondition(condition) {
            // Hapus semua polyline dari peta
            this.map.eachLayer(layer => {
                if (layer instanceof L.Polyline) {
                    // this.removeLabelMarker();
                    this.map.removeLayer(layer);
                }
            });

            // Filter dan tambahkan polyline yang sesuai dengan kondisi yang dipilih
            this.jalanData.forEach(jalan => {
                if (this.kondisiData[jalan.kondisi_id] === condition) {
                    try {
                        const decompressedPolyline = this.decompressCoordinate(jalan.paths);
                        const jenisJalan = this.kondisiData[jalan.kondisi_id];
                        let color = 'blue';
                        if (jenisJalan === 'Sedang') {
                            color = 'yellow';
                        } else if (jenisJalan === 'Rusak') {
                            color = 'red';
                        } else if (jenisJalan === 'Baik') {
                            color = 'green';
                        }

                        const polyline = L.polyline(JSON.parse(decompressedPolyline), { color }).addTo(this.map);


                        polyline.on('click', () => {
                            const eksisting = this.eksistingData[jalan.eksisting_id] || 'Unknown';
                            const jenisJalan = this.jenisJalanData[jalan.jenisjalan_id] || 'Unknown';
                            const kondisi = this.kondisiData[jalan.kondisi_id] || 'Unknown';

                            // Temukan nama desa dari this.desafull
                            const desaObj = this.desafull.find(d => d.id === jalan.desa_id);
                            console.log(this.desafull);
                            const desa = desaObj ? desaObj.desa : 'Unknown';

                            polyline.bindPopup(`
                                    <h4 class="text-center">Jln. ${jalan.nama_ruas}</h4>
                                    <br>
                                    <div class="dp-in-table w-50">
                                        <strong class="mx-1">Kode Ruas:</strong> ${jalan.kode_ruas}<br>
                                        <strong class="mx-1">Nama Desa:</strong> ${desa}<br>
                                        <strong class="mx-1">Jenis Jalan:</strong> ${jenisJalan}<br>
                                        <strong class="mx-1">Keterangan:</strong> ${jalan.keterangan}<br>
                                    </div>
                                    <div class="dp-in-table w-45">
                                        <strong>Lebar:</strong> ${jalan.lebar}<br>
                                        <strong>Panjang:</strong> ${jalan.panjang}<br>
                                        <strong>Eksisting:</strong> ${eksisting}<br>
                                        <strong>Kondisi Jalan:</strong> ${kondisi}<br>
                                    </div>
                                    <button class="btn mt-1 btn-warning" onclick="saveAndEdit('${jalan.id}')">Edit</button>
                                `, {
                                maxWidth: 400,
                                minWidth: 300
                            }).openPopup();

                        });
                    } catch (error) {
                        console.error('Error parsing coordinate data:', error);
                    }
                }
            });
        },
        filterByRoadType(type) {
            // Hapus semua polyline dari peta
            this.map.eachLayer(layer => {
                if (layer instanceof L.Polyline) {
                    this.map.removeLayer(layer);
                    // this.removeLabelMarker();
                }
            });

            // Filter dan tambahkan polyline yang sesuai dengan jenis jalan yang dipilih
            this.jalanData.forEach(jalan => {
                if (this.jenisJalanData[jalan.jenisjalan_id] === type) {
                    try {
                        const decompressedPolyline = this.decompressCoordinate(jalan.paths);
                        const jenisJalan = this.jenisJalanData[jalan.jenisjalan_id];
                        let color = 'blue';
                        if (jenisJalan === 'Desa') {
                            color = 'blue';
                        } else if (jenisJalan === 'Kabupaten') {
                            color = 'red';
                        } else if (jenisJalan === 'Provinsi') {
                            color = 'green';
                        }

                        const polyline = L.polyline(JSON.parse(decompressedPolyline), { color }).addTo(this.map);

                        polyline.on('click', () => {
                            const eksisting = this.eksistingData[jalan.eksisting_id] || 'Unknown';
                            const jenisJalan = this.jenisJalanData[jalan.jenisjalan_id] || 'Unknown';
                            const kondisi = this.kondisiData[jalan.kondisi_id] || 'Unknown';

                            // Temukan nama desa dari this.desafull
                            const desaObj = this.desafull.find(d => d.id === jalan.desa_id);
                            console.log(this.desafull);
                            const desa = desaObj ? desaObj.desa : 'Unknown';

                            polyline.bindPopup(`
                                    <h4 class="text-center">Jln. ${jalan.nama_ruas}</h4>
                                    <br>
                                    <div class="dp-in-table w-50">
                                        <strong class="mx-1">Kode Ruas:</strong> ${jalan.kode_ruas}<br>
                                        <strong class="mx-1">Nama Desa:</strong> ${desa}<br>
                                        <strong class="mx-1">Jenis Jalan:</strong> ${jenisJalan}<br>
                                        <strong class="mx-1">Keterangan:</strong> ${jalan.keterangan}<br>
                                    </div>
                                    <div class="dp-in-table w-45">
                                        <strong>Lebar:</strong> ${jalan.lebar}<br>
                                        <strong>Panjang:</strong> ${jalan.panjang}<br>
                                        <strong>Eksisting:</strong> ${eksisting}<br>
                                        <strong>Kondisi Jalan:</strong> ${kondisi}<br>
                                    </div>
                                    <button class="btn mt-1 btn-warning" onclick="saveAndEdit('${jalan.id}')">Edit</button>
                                `, {
                                maxWidth: 400,
                                minWidth: 300
                            }).openPopup();

                        });
                    } catch (error) {
                        console.error('Error parsing coordinate data:', error);
                    }
                }
            });
        },
        toggleNavbar() {
            this.isNavbarVisible = !this.isNavbarVisible;
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
                this.desafull = response.data.desa;
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
                const jalanData2 = response.data.ruasjalan;
                this.jalanData = response.data.ruasjalan;

                // Pastikan data yang diterima adalah array
                if (Array.isArray(jalanData2)) {
                    // Loop melalui data jalan
                    jalanData2.forEach(jalan => {
                        try {
                            // Dekompresi koordinat sebelum menambahkan polyline ke peta
                            const decompressedPolyline = this.decompressCoordinate(jalan.paths);

                            const jenisJalan = this.jenisJalanData[jalan.jenisjalan_id];
                            let color = 'blue';
                            if (jenisJalan === 'Desa') {
                                color = 'blue';
                            } else if (jenisJalan === 'Kabupaten') {
                                color = 'red';
                            } else if (jenisJalan === 'Provinsi') {
                                color = 'green';
                            }

                            const polyline = L.polyline(JSON.parse(decompressedPolyline), { color }).addTo(this.map);

                            // Gambar label kode ruas di atas polyline
                            const midPointIndex = Math.floor(JSON.parse(decompressedPolyline).length / 2);
                            const midPoint = JSON.parse(decompressedPolyline)[midPointIndex];
                            const labelMarker = L.marker(midPoint, {
                                icon: L.divIcon({
                                    className: 'label-icon',
                                    html: `<span class="label-text">${jalan.kode_ruas}</span>`,
                                    iconSize: [100, 40] // Sesuaikan ukuran ikon label
                                })
                            }).addTo(this.map);

                            // Gambar polyline berdasarkan koordinat yang sudah didekompresi
                            // this.displayDataOnMap();
                            // const polyline = L.polyline(JSON.parse(decompressedPolyline), { color: 'darkblue' }).addTo(this.map);
                            polyline.on('click', () => {
                                const eksisting = this.eksistingData[jalan.eksisting_id] || 'Unknown';
                                const jenisJalan = this.jenisJalanData[jalan.jenisjalan_id] || 'Unknown';
                                const kondisi = this.kondisiData[jalan.kondisi_id] || 'Unknown';

                                // Temukan nama desa dari this.desafull
                                const desaObj = this.desafull.find(d => d.id === jalan.desa_id);
                                console.log(this.desafull);
                                const desa = desaObj ? desaObj.desa : 'Unknown';

                                polyline.bindPopup(`
                                    <h4 class="text-center">Jln. ${jalan.nama_ruas}</h4>
                                    <br>
                                    <div class="dp-in-table w-50">
                                        <strong class="mx-1">Kode Ruas:</strong> ${jalan.kode_ruas}<br>
                                        <strong class="mx-1">Nama Desa:</strong> ${desa}<br>
                                        <strong class="mx-1">Jenis Jalan:</strong> ${jenisJalan}<br>
                                        <strong class="mx-1">Keterangan:</strong> ${jalan.keterangan}<br>
                                    </div>
                                    <div class="dp-in-table w-45">
                                        <strong>Lebar:</strong> ${jalan.lebar}<br>
                                        <strong>Panjang:</strong> ${jalan.panjang}<br>
                                        <strong>Eksisting:</strong> ${eksisting}<br>
                                        <strong>Kondisi Jalan:</strong> ${kondisi}<br>
                                    </div>
                                    <button class="btn mt-1 btn-warning shadow-2 p-fixed" onclick="saveAndEdit('${jalan.id}')"><i class="bi bi-pencil-fill"></i>Edit</button>
                                `, {
                                    maxWidth: 400,
                                    minWidth: 300
                                }).openPopup();

                            });

                            this.labelMarkers.push(labelMarker);
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
        displayDataOnMap() {
            this.layerGroup = L.layerGroup().addTo(this.map);

            this.jalanData.forEach(jalan => {
                try {
                    const decompressedPolyline = this.decompressCoordinate(jalan.paths);

                    const kondisi = this.kondisiData[jalan.kondisi_id];
                    let color = 'blue';
                    if (kondisi === 'Rusak') {
                        color = 'red';
                    } else if (kondisi === 'Sedang') {
                        color = 'darkred';
                    } else if (kondisi === 'Baik') {
                        color = 'green';
                    }

                    const polyline = L.polyline(JSON.parse(decompressedPolyline), { color }).addTo(this.map);
                } catch (error) {
                    console.error('Error parsing coordinate data:', error);
                }
            });
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
            this.setMapViewForKabupaten();
        },
        onKecamatanChange() {
            this.fetchDesa();
            this.selectedDesa = null;
            this.setMapViewForKecematan();
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
        },
        setMapViewForKecematan() {
            const kecamatan = this.kecamatans.find(d => d.id === this.selectedKecamatan);
            if (kecamatan && this.kecematanCoordinates[kecamatan.value]) {
                const [lat, lng] = this.kecematanCoordinates[kecamatan.value];
                this.map.setView([lat, lng], 13);
            }
        },
        setMapViewForKabupaten() {
            const kabupaten = this.kabupatens.find(d => d.id === this.selectedKabupaten);
            if (kabupaten && this.kabupatenCoordinates[kabupaten.value]) {
                const [lat, lng] = this.kabupatenCoordinates[kabupaten.value];
                this.map.setView([lat, lng], 12);
            }
        },
        searchByName() {
            const searchQuery = this.searchQuery.toLowerCase().trim();
            const matchedPolylines = this.jalanData.filter(jalan => jalan.nama_ruas.toLowerCase().includes(searchQuery));
            if (matchedPolylines.length > 0) {
                // Zoom ke ruas jalan
                const firstMatch = matchedPolylines[0];
                const coordinates = JSON.parse(this.decompressCoordinate(firstMatch.paths));
                this.map.flyToBounds(coordinates);
            } else {
                Swal.fire({
                    text: "Nama ruas tidak ditemukan.",
                    icon: "warning"
                });
                // alert('Nama ruas tidak ditemukan.');
            }
        },
    },
}

window.saveAndEdit = function (id) {
    localStorage.setItem('id', id);
    window.location.href = '/editruasjalan';
};
</script>
