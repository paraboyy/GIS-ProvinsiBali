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
                            <a class="nav-link" href="/create">Laporkan Jalan Rusak</a>
                        </li>
                        <!-- <li class="nav-item">
                            <a class="nav-link" href="/road">Detail Jalan</a>
                        </li> -->
                        <li class="nav-item">
                            <a class="nav-link" href="/data">Data Laporan Jalan Rusak</a>
                        </li>
                    </ul>
                    <!-- <button class="btn btn-danger m-2 shadow-2" @click="logout()"><i
                            class="bi bi-box-arrow-right mx-1"></i>Logout</button> -->
                </div>
                <a class="navbar-brand" href="#">
                    <img src="https://www.baliprov.go.id/assets/img/nav_bar.png" alt="Logo" width="30" height="30"
                        class="d-inline-block align-top">
                    GIS || Provinsi Bali
                </a>
            </div>
        </nav>

        <div class="d-flex background p-2" style="height: 100vh; width: 100vw;">
            <div class=" card shadow mx-2" style="width: 100%;">
                <div class="row justify-content-center">
                    <button @click="enableEditMode" class="btn btn-success mt-2 w-25 mx-2 shadow-2"><i
                            class="bi bi-pencil-fill mx-2"></i>Edit
                        Titik Jalan</button>
                    <button @click="undoLastPoint" class="btn btn-warning mt-2 w-25 mx-2 shadow-2"><i
                            class="bi bi-arrow-counterclockwise mx-2"></i>Undo
                        Titik Jalan</button>
                    <button @click="deleteLastPoint" class="btn btn-danger mt-2 w-25 mx-2 shadow-2"><i
                            class="bi bi-trash-fill mx-2"></i>Hapus
                        Titik Jalan</button>
                </div>
                <div class="card-body">
                    <div id="map" ref="map" style="height: 100%; width: 100%;"></div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card shadow bg-warning mx-2 mb-3 p-3">
                    <h5 class="text-dark">NOTE!!</h5>
                    <P>Lakukan aksi klik pada maps untuk membuat garis jalan rusak </P>
                </div>
                <div class="card shadow mx-2">
                    <div class="card-body">
                        <form @submit.prevent="tambahJalan">
                            <div class="mb-3">
                                <label for="province" class="form-label">Pilih Provinsi:</label>
                                <select id="province" class="form-select shadow-2" v-model="selectedProvince"
                                    @change="onProvinceChange">
                                    <option v-for="province in provinces" :key="province.id" :value="province.id">
                                        {{ province.provinsi }}
                                    </option>
                                </select>
                            </div>
                            <div v-if="kabupatens.length" class="mb-3">
                                <label for="kabupaten" class="form-label">Pilih Kabupaten:</label>
                                <select id="kabupaten" class="form-select shadow-2" v-model="selectedKabupaten"
                                    @change="onKabupatenChange">
                                    <option v-for="kabupaten in kabupatens" :key="kabupaten.id" :value="kabupaten.id">
                                        {{ kabupaten.value }}
                                    </option>
                                </select>
                            </div>
                            <div v-if="kecamatans.length" class="mb-3">
                                <label for="kecamatan" class="form-label">Pilih Kecamatan:</label>
                                <select id="kecamatan" class="form-select shadow-2" v-model="selectedKecamatan"
                                    @change="onKecamatanChange">
                                    <option v-for="kecamatan in kecamatans" :key="kecamatan.id" :value="kecamatan.id">
                                        {{ kecamatan.value }}
                                    </option>
                                </select>
                            </div>
                            <div class="dp-flex mb-2">
                                <div class="form-group w-50 mr-1">
                                    <label for="desa">Nama Desa:</label>
                                    <select id="desa" class="form-select shadow-2" v-model="selectedDesa"
                                        @change="onDesaChange">
                                        <option v-for="desa in desas" :key="desa.id" :value="desa.id">
                                            {{ desa.value }}
                                        </option>
                                    </select>
                                </div>
                                <div class="form-group w-45">
                                    <label for="lebar">Lebar Ruas:</label>
                                    <input type="text" class="form-control shadow-2" v-model="jalanForm.lebar" required>
                                </div>
                            </div>
                            <div class="dp-flex mb-2">
                                <div class="form-group w-65 mr-1">
                                    <label for="nama_ruas">Nama Ruas:</label>
                                    <input type="text" class="form-control shadow-2" v-model="jalanForm.nama_ruas"
                                        required>
                                </div>
                                <div class="form-group w-30">
                                    <label for="kode_ruas">Kode Ruas:</label>
                                    <input type="text" class="form-control shadow-2" v-model="jalanForm.kode_ruas"
                                        required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="eksisting">Eksisting:</label>
                                <select id="eksisting" class="form-select shadow-2" v-model="selectedEksisting"
                                    @change="onEksistingChange">
                                    <option v-for="eksisting in eksistings" :key="eksisting.id" :value="eksisting.id">
                                        {{ eksisting.eksisting }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="kondisi">Kondisi:</label>
                                <select id="kondisi" class="form-select shadow-2" v-model="selectedKondisi"
                                    @change="onKondisiChange">
                                    <option v-for="kondisi in kondisis" :key="kondisi.id" :value="kondisi.id">
                                        {{ kondisi.kondisi }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="jenis_jalan">Jenis Jalan:</label>
                                <select id="jenis_jalan" class="form-select shadow-2" v-model="selectedJenisJalan"
                                    @change="onJenisJalanChange">
                                    <option v-for="jenis_jalan in jenisJalans" :key="jenis_jalan.id"
                                        :value="jenis_jalan.id">
                                        {{ jenis_jalan.jenisjalan }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="keterangan">Keterangan:</label>
                                <input type="text" class="form-control shadow-2" v-model="jalanForm.keterangan"
                                    required>
                            </div>
                            <button type="submit" class="btn-2 hvr-green c-primary mt-4 shadow-2">Tambah Jalan</button>
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
import 'leaflet-editable';
import 'bootstrap-icons/font/bootstrap-icons.css';


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
                // Tambahkan koordinat desa 
            }, kecematanCoordinates: {
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
        }
    },

    mounted() {
        // Inisialisasi peta Leaflet
        this.map = L.map('map').setView([-8.4253951, 115.1832866], 10);

        // Menambahkan layer peta OpenStreetMap
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        // Menangani event klik pada peta untuk menggambar polyline
        this.map.on('click', this.onMapClick);

        this.fetchJalanData();
        this.enableEditMode();
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
        enableEditMode() {
            // Aktifkan mode edit pada polyline
            if (this.polyline) {
                this.polyline.enableEdit();
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
                this.map.setView(coords, 16); // Atur zoom level sesuai kebutuhan
            } else {
                console.error('Koordinat untuk desa ini tidak tersedia.');
            }
        },
        setMapViewForKecematan() {
            const kecamatan = this.kecamatans.find(d => d.id === this.selectedKecamatan);
            if (kecamatan && this.kecematanCoordinates[kecamatan.value]) {
                const [lat, lng] = this.kecematanCoordinates[kecamatan.value];
                this.map.setView([lat, lng], 13);
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
                Swal.fire({
                    text: "Jalan berhasil ditambahkan",
                    icon: "success"
                });
                // alert('Jalan berhasil ditambahkan');

                this.fetchJalanData();
                this.jalanForm.nama_ruas = '';
                this.jalanForm.lebar = '';
                this.jalanForm.kode_ruas = '';
                this.jalanForm.keterangan = '';
                this.selectedEksisting = null;
                this.selectedKondisi = null;
                this.selectedJenisJalan = null;
                this.polylineCoords = [];
                if (this.polyline) {
                    this.map.removeLayer(this.polyline);
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    text: "Gagal menambahkan jalan",
                    icon: "error"
                });
                // alert('Gagal menambahkan jalan');
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
                            const polyline = L.polyline(JSON.parse(decompressedPolyline), { color: 'darkblue' }).addTo(this.map);

                            // Gambar label kode ruas di atas polyline
                            const midPointIndex = Math.floor(JSON.parse(decompressedPolyline).length / 2);
                            const midPoint = JSON.parse(decompressedPolyline)[midPointIndex];

                            const minZoomToShowLabel = 12;
                            const maxZoomToShowLabel = 19;

                            // Gunakan event pada peta untuk mengatur visibilitas marker berdasarkan zoom level
                            this.map.on('zoomend', () => {
                                const currentZoom = this.map.getZoom();

                                if (currentZoom >= minZoomToShowLabel && currentZoom <= maxZoomToShowLabel) {
                                    const labelMarker =  L.marker(midPoint, {
                                        icon: L.divIcon({
                                            className: 'label-icon',
                                            html: `<span class="label-text">${jalan.kode_ruas}</span>`,
                                            iconSize: [100, 40]
                                        })
                                    }).addTo(this.map);
                                } else {
                                    // Hapus marker jika zoom tidak berada dalam rentang yang ditentukan
                                    if (this.map.hasLayer(labelMarker)) {
                                        this.map.removeLayer(labelMarker);
                                    }
                                }
                            });

                            polyline.on('click', () => {
                                polyline.bindPopup(`
                                    <button class="btn mt-1 btn-warning shadow-2" onclick="saveAndEdit('${jalan.id}')"><i class="bi bi-pencil-fill"></i>Edit</button>
                                `, {
                                    maxWidth: 400,
                                    minWidth: 300
                                }).openPopup();

                            });
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
                // this.kabupatens = response.data.kabupaten;
                // this.kecamatans = response.data.kecamatan;
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
            this.setMapViewForKabupaten();
        },
        onKecamatanChange() {
            this.fetchDesa();
            this.setMapViewForKecematan();
        },
        undoLastPoint() {
            // Hapus titik terakhir dari polylineCoords
            this.polylineCoords.pop();

            // Hapus polyline yang ada jika ada
            if (this.polyline) {
                this.map.removeLayer(this.polyline);
            }

            // Gambar polyline baru jika masih ada koordinat
            if (this.polylineCoords.length > 0) {
                this.polyline = L.polyline(this.polylineCoords, { color: 'red' }).addTo(this.map);
            }

            // Hitung ulang panjang polyline
            this.jalanForm.panjang = this.calculatePolylineLength(this.polylineCoords);

            // Konversi polyline menjadi string
            this.polylineString = JSON.stringify(this.polylineCoords);
        },
        deleteLastPoint() {
            this.polylineCoords = [];
            if (this.polyline) {
                this.map.removeLayer(this.polyline);
            }
        },
        setMapViewForKabupaten() {
            const kabupaten = this.kabupatens.find(d => d.id === this.selectedKabupaten);
            if (kabupaten && this.kabupatenCoordinates[kabupaten.value]) {
                const [lat, lng] = this.kabupatenCoordinates[kabupaten.value];
                this.map.setView([lat, lng], 12);
            }
        },
        async logout() {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`https://gisapis.manpits.xyz/api/logout`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.$router.push({ name: 'Home2' });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: "Error!",
                    text: "Terjadi kesalahan saat logout.",
                    icon: "error"
                });
            }
        },
    }
}
</script>

<style>
/* Tambahkan gaya kustom Anda di sini */
</style>
