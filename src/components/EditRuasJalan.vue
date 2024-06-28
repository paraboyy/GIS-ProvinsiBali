<template>
    <div class="background" style="height: 100vh;">
        <div class=" dp-flex card-edit p-3" style="width: 100%;">
            <div class="bg-light w-200 p-4 mr-2 br-1 shadow-3" style="height: 90vh;">
                <button class=" btn btn-warning mx-2 mb-2 shadow" @click="clearPolylines">Hapus Polyline</button>
                <div class="card-maps">
                    <div id="map" ref="map" style="height: 90%; width: 100%;"></div>
                </div>
            </div>
            <div class="container card p-4" style="height: 50%;">
                <h2>Edit Ruas Jalan</h2>
                <form @submit.prevent="updateRuasJalan">
                    <div class="dp-flex">
                        <div class="mb-3 w-45 mr-2">
                            <label for="kodeRuas" class="form-label">Kode Ruas</label>
                            <input type="text" class="form-control shadow-2" id="kodeRuas" v-model="jalan.kode_ruas"
                                required>
                        </div>
                        <div class="mb-3 w-45">
                            <label for="editNamaKabupaten" class="form-label">Nama Kabupaten</label>
                            <select class="form-select shadow-2" id="editNamaKabupaten" v-model="selectedKabupaten"
                                @change="fetchKecamatanByKabupatenId">
                                <option v-for="(name, id) in kabupatenData" :value="id">{{ name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="dp-flex">
                        <div class="mb-3 w-45 mr-2">
                            <label for="editNamaKecamatan" class="form-label">Nama Kecamatan</label>
                            <select class="form-select shadow-2" id="editNamaKecamatan" v-model="selectedKecamatan"
                                @change="fetchDesaByKecamatanId">
                                <option v-for="(name, id) in kecamatanData" :value="id">{{ name }}</option>
                            </select>
                        </div>
                        <div class="mb-3 w-45">
                            <label for="editNamaDesa" class="form-label">Nama Desa</label>
                            <select class="form-select shadow-2" id="editNamaDesa" v-model="jalan.desa_id">
                                <option v-for="(name, id) in desaData" :value="id">{{ name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="dp-flex">
                        <div class="mb-3 mr-2 w-45">
                            <label for="namaRuas" class="form-label">Nama Ruas</label>
                            <input type="text" class="form-control shadow-2" id="namaRuas" v-model="jalan.nama_ruas"
                                required>
                        </div>
                        <div class="mb-3 w-45">
                            <label for="lebarJalan" class="form-label">Lebar Jalan</label>
                            <input type="text" class="form-control shadow-2" id="lebarJalan" v-model="jalan.lebar"
                                required>
                        </div>
                    </div>
                    <div class="dp-flex">
                        <div class="mb-3 mr-1">
                            <label for="editKondisi" class="form-label">Kondisi</label>
                            <select class="form-select shadow-2" id="editKondisi" v-model="jalan.kondisi_id">
                                <option v-for="(name, id) in kondisiData" :value="id">{{ name }}</option>
                            </select>
                        </div>
                        <div class="mb-3 mr-1">
                            <label for="editEksisting" class="form-label">Eksisting</label>
                            <select class="form-select shadow-2" id="editEksisting" v-model="jalan.eksisting_id">
                                <option v-for="(name, id) in eksistingData" :value="id">{{ name }}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="editJenisJalan" class="form-label">Jenis Jalan</label>
                            <select class="form-select shadow-2" id="editJenisJalan" v-model="jalan.jenisjalan_id">
                                <option v-for="(name, id) in jenisJalanData" :value="id">{{ name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="keterangan" class="form-label">Keterangan</label>
                        <textarea class="form-control shadow-2" id="keterangan" v-model="jalan.keterangan"></textarea>
                    </div>
                    <button type="submit" class="shadow-2 effect-success effect-5 mx-2">Update</button>
                    <button class="effect-danger effect-5 shadow-2" @click="back">Kembali</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import L from 'leaflet';
import pako from 'pako';
// import Swal from 'sweetalert2';

export default {
    data() {
        return {
            jalan: {
                desa_id: null,
                kode_ruas: '',
                nama_ruas: '',
                lebar: '',
                panjang: '',
                kondisi_id: '',
                eksisting_id: '',
                jenisjalan_id: '',
                keterangan: '',
            },
            polyline: null,
            polylineCoords: [],
            polylines: [],
            polylineString: '',
            kondisiData: {},
            eksistingData: {},
            jenisJalanData: {},
            desaData: {},
            kecamatanData: {},
            kabupatenData: {},
            selectedKabupaten: null,
            selectedKecamatan: null,
            isDataDisplayed: false,
        };
    },
    created() {
        this.fetchRuasJalan();
        this.fetchKondisiData();
        this.fetchEksistingData();
        this.fetchJenisJalanData();
        this.fetchAllKabupaten();
    },
    mounted() {
        this.map = L.map('map').setView([-8.4253951, 115.1832866], 10);
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        if (!this.isDataDisplayed) {
            this.displayDataOnMap();
            this.isDataDisplayed = true; 
        }

        this.map.on('click', this.onMapClick);
    },
    methods: {
        async fetchRuasJalan() {
            try {
                const token = localStorage.getItem('token');
                const id = localStorage.getItem('id');
                const response = await axios.get(`https://gisapis.manpits.xyz/api/ruasjalan/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.jalan = response.data.ruasjalan;

                if (this.jalan.desa_id) {
                    await this.fetchKecamatanByDesaId(this.jalan.desa_id);
                }

                if (this.polyline) {
                    this.map.removeLayer(this.polyline);
                }

                if (this.jalan.paths) {
                    this.polylineCoords = JSON.parse(this.decompressCoordinate(this.jalan.paths));
                    this.polyline = L.polyline(this.polylineCoords, { color: 'darkblue', draggable: true }).addTo(this.map);
                    // this.polyline.on('dragend', this.onPolylineDragEnd);

                    this.map.fitBounds(this.polyline.getBounds());
                }
            } catch (error) {
                console.error(error);
            }
        },
        async updateRuasJalan() {
            try {
                const token = localStorage.getItem('token');
                const id = localStorage.getItem('id');

                if (this.polylineCoords.length) {
                    this.jalan.paths = this.compressCoordinate(JSON.stringify(this.polylineCoords));
                }

                await axios.put(`https://gisapis.manpits.xyz/api/ruasjalan/${id}`, this.jalan, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                Swal.fire({
                    title: 'Success!',
                    text: 'Berhasil memperbarui Data',
                    icon: 'success'
                }).then(() => {
                    this.$router.push('/data');
                });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Gagal memperbarui Data',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        },
        back() {
            this.$router.push({ name: 'DataJalan' });
        },
        async displayDataOnMap() {
            try {
                const token = localStorage.getItem('token');
                const id = localStorage.getItem('id');

                if (!id || !token) {
                    throw new Error('Missing ID atau token di localStorage');
                }

                const response = await axios.get(`https://gisapis.manpits.xyz/api/ruasjalan/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const jalanData = response.data.ruasjalan;

                if (Array.isArray(jalanData)) {
                    jalanData.forEach(this.processJalan);
                } else if (typeof jalanData === 'object') {
                    this.processJalan(jalanData);
                } else {
                    console.error('Format data tidak valid:', jalanData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        processJalan(jalan) {
            try {
                if (!jalan.paths) {
                    console.error('Missing paths in jalan object:', jalan);
                    return;
                }

                const decompressedPolyline = this.decompressCoordinate(jalan.paths);
                const coordinates = JSON.parse(decompressedPolyline);

                if (!Array.isArray(coordinates)) {
                    console.error('Format koordinat tidak valid:', coordinates);
                    return;
                }

                if (this.polyline) {
                    this.map.removeLayer(this.polyline);
                }

                this.polyline = L.polyline(coordinates, { color: 'darkblue', draggable: true }).addTo(this.map);
                // polyline.on('dragend', this.onPolylineDragEnd);
                this.polyline.push(polyline);

                this.map.fitBounds(polyline.getBounds());
            } catch (error) {
                console.error('Error processing jalan object:', jalan, error);
            }
        },
        onPolylineDragEnd(event) {
            const newCoords = event.target.getLatLngs();
            const index = this.polylines.findIndex(polyline => polyline === event.target);

            if (index !== -1) {
                this.polylineCoords[index] = newCoords;
            }

            this.polylineString = JSON.stringify(this.polylineCoords);
        },
        decompressCoordinate(compressedCoordinate) {
            const compressed = Uint8Array.from(atob(compressedCoordinate), c => c.charCodeAt(0));
            const decompressed = pako.inflate(compressed, { to: 'string' });
            return decompressed;
        },
        compressCoordinate(decompressedCoordinate) {
            const compressed = pako.deflate(decompressedCoordinate, { to: 'string' });
            return btoa(String.fromCharCode.apply(null, new Uint8Array(compressed)));
        },
        clearPolylines() {
            if (this.polyline) {
                this.map.removeLayer(this.polyline);
            }
            this.polylines = [];
            this.polylineCoords = [];
            this.polyline = null;
        },
        onMapClick(e) {
            this.polylineCoords.push(e.latlng);

            if (this.polyline) {
                this.map.removeLayer(this.polyline);
            }

            this.polyline = L.polyline(this.polylineCoords, { color: 'red', draggable: true }).addTo(this.map);
            // this.polyline.on('dragend', this.onPolylineDragEnd);

            this.jalan.panjang = this.calculatePolylineLength(this.polylineCoords);
            this.polylineString = JSON.stringify(this.polylineCoords);
        },
        async fetchKondisiData() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mkondisi', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const kondisiData = response.data.eksisting;

                kondisiData.forEach(item => {
                    this.kondisiData[item.id] = item.kondisi;
                });
            } catch (error) {
                console.error('Gagal mengambil data kondisi jalan:', error);
            }
        },
        async fetchEksistingData() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/meksisting', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const eksistingData = response.data.eksisting;

                eksistingData.forEach(item => {
                    this.eksistingData[item.id] = item.eksisting;
                });
            } catch (error) {
                console.error('Gagal mengambil data eksisting:', error);
            }
        },
        async fetchJenisJalanData() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mjenisjalan', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const jenisJalanData = response.data.eksisting;

                jenisJalanData.forEach(item => {
                    this.jenisJalanData[item.id] = item.jenisjalan;
                });
            } catch (error) {
                console.error('Gagal mengambil data jenis jalan:', error);
            }
        },
        async fetchAllKabupaten() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mregion', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const kabupatenData = response.data.kabupaten;

                kabupatenData.forEach(item => {
                    this.kabupatenData[item.id] = item.kabupaten;
                });
            } catch (error) {
                console.error('Gagal mengambil data kabupaten', error);
            }
        },
        async fetchKecamatanByKabupatenId() {
            try {
                const token = localStorage.getItem('token');
                const idKabupaten = this.selectedKabupaten;

                const response = await axios.get(`https://gisapis.manpits.xyz/api/kecamatan/${idKabupaten}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                this.kecamatanData = {};
                response.data.kecamatan.forEach(item => {
                    this.kecamatanData[item.id] = item.value;
                });

                // this.selectedKecamatan = null;
                this.desaData = {};
            } catch (error) {
                console.error('Gagal mengambil data kecamatan berdasarkan kabupaten', error);
            }
        },
        async fetchDesaByKecamatanId() {
            try {
                const token = localStorage.getItem('token');
                const idKecamatan = this.selectedKecamatan;

                const response = await axios.get(`https://gisapis.manpits.xyz/api/desa/${idKecamatan}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                this.desaData = {};
                response.data.desa.forEach(item => {
                    this.desaData[item.id] = item.value;
                });
            } catch (error) {
                console.error('Gagal mengambil data desa berdasarkan kecamatan', error);
            }
        },
        async fetchKecamatanByDesaId(desaId) {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get(`https://gisapis.manpits.xyz/api/kecamatanbydesaid/${desaId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const kecamatan = response.data.kecamatan;
                this.selectedKabupaten = response.data.kabupaten.id;
                this.selectedKecamatan = kecamatan.id;

                await this.fetchKecamatanByKabupatenId();
                await this.fetchDesaByKecamatanId();
            } catch (error) {
                console.error('Gagal mengambil data kecamatan berdasarkan desa', error);
            }
        },
        calculatePolylineLength(coords) {
            let length = 0;
            for (let i = 1; i < coords.length; i++) {
                length += this.map.distance(coords[i - 1], coords[i]);
            }
            return length;
        }
    }
};
</script>
