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
                        <li class="nav-item">
                            <button class="nav-link" @click="toggleJumlahData">Tampilkan Jumlah Data</button>
                        </li>
                    </ul>
                </div>
                <a href="/" class="d-flex align-items-center">
                    <button class="btn btn-danger m-2">Logout</button>
                </a>
            </div>
        </nav>

        <div v-if="showJumlahData" class="mt-2 row" style="justify-content: center;">
            <!-- Bagian untuk menampilkan jumlah jenis jalan dan kondisi jalan -->
            <div class="w-25">
                <h4>Jumlah Jenis Jalan</h4>
                <ul>
                    <li>Kabupaten: {{ jumlahJenisJalan.Kabupaten }}</li>
                    <li>Desa: {{ jumlahJenisJalan.Desa }}</li>
                    <li>Provinsi: {{ jumlahJenisJalan.Provinsi }}</li>
                </ul>  
            </div>
            <div class="w-25">
                <h4>Jumlah Kondisi Jalan</h4>
                <ul>
                    <li>Rusak: {{ jumlahKondisiJalan.Rusak }} ({{ (jumlahKondisiJalan.Rusak / jalanData.length *
                                    100).toFixed(2) }}%)</li>
                    <li>Bagus: {{ jumlahKondisiJalan.Bagus }} ({{ (jumlahKondisiJalan.Bagus / jalanData.length *
                                    100).toFixed(2) }}%)</li>
                    <li>Sedang: {{ jumlahKondisiJalan.Sedang }} ({{ (jumlahKondisiJalan.Sedang / jalanData.length *
                        100).toFixed(2) }}%)</li>
                </ul>
            </div>
        </div>

        <div id="map" style="height: 100vh; width: 100vw;"></div>

        <!-- Search Button -->
        <div class=" bg-light p-2 radius leaflet-bar" style="position: absolute; top: 10%; right: 2%; z-index: 1000;">
            <input type="text" class="form-control me-2" placeholder="Cari nama ruas" v-model="searchQuery">
            <button class="btn btn-outline-success mt-2" @click="searchByName">Cari</button>
        </div>

        <!-- Edit Modal -->
        <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Edit Ruas Jalan</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="mb-3">
                                <label for="editNamaRuas" class="form-label">Nama Ruas</label>
                                <input type="text" class="form-control" id="editNamaRuas">
                            </div>
                            <div class="mb-3">
                                <label for="editNamaDesa" class="form-label">Nama desa</label>
                                <select class="form-control" id="editNamaDesa">
                                    <option v-for="(value, key) in desaData" :value="key">{{ value }}</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editLebarRuas" class="form-label">Lebar Ruas</label>
                                <input type="text" class="form-control" id="editLebarRuas">
                            </div>
                            <div class="mb-3">
                                <label for="editKodeRuas" class="form-label">Kode Ruas</label>
                                <input type="text" class="form-control" id="editKodeRuas">
                            </div>
                            <div class="mb-3">
                                <label for="editKeterangan" class="form-label">Keterangan</label>
                                <input type="text" class="form-control" id="editKeterangan">
                            </div>
                            <div class="mb-3">
                                <label for="editKondisi" class="form-label">Kondisi</label>
                                <select class="form-control" id="editKondisi">
                                    <option v-for="(value, key) in kondisiData" :value="key">{{ value }}</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editEksisting" class="form-label">Eksisting</label>
                                <select class="form-control" id="editEksisting">
                                    <option v-for="(value, key) in eksistingData" :value="key">{{ value }}</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editJenisJalan" class="form-label">Jenis Jalan</label>
                                <select class="form-control" id="editJenisJalan">
                                    <option v-for="(value, key) in jenisJalanData" :value="key">{{ value }}</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        <button id="btnSimpanEdit" type="button" class="btn btn-primary">Simpan Perubahan</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import L from 'leaflet';
import axios from 'axios';
import pako from 'pako';
import mitt from 'mitt';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const emitter = mitt();

export default {
    data() {
        return {
            map: null,
            jalanData: [],
            kondisiData: {},
            eksistingData: {},
            jenisJalanData: {},
            desaData: {},
            jumlahJenisJalan: {},
            jumlahKondisiJalan: {},
            showJumlahData: false
        };
    },
    mounted() {
        this.initializeMap();
        this.fetchKondisiData();
        this.fetchEksistingData();
        this.fetchJenisJalanData();
        this.fetchDesaData();

        emitter.on('editPolyline', this.editPolyline);
        emitter.on('deletePolyline', this.deletePolyline);
    },
    beforeUnmount() {
        emitter.off('editPolyline', this.editPolyline);
        emitter.off('deletePolyline', this.deletePolyline);
    },
    methods: {
        initializeMap() {
            this.map = L.map('map').setView([-8.4253951, 115.1832866], 10);

            this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.map);
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

                this.fetchJalanData();
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
        async fetchDesaData() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mregion', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const desaData = response.data.desa;

                desaData.forEach(item => {
                    this.desaData[item.id] = item.desa;
                });
            } catch (error) {
                console.error('Gagal mengambil data desa', error);
            }
        },
        async fetchJalanData() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/ruasjalan', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const jalanData = response.data.ruasjalan;

                if (Array.isArray(jalanData)) {
                    this.jalanData = jalanData;

                    // Hitung jumlah jenis jalan
                    this.jumlahJenisJalan = this.countJenisJalan();
                    // Hitung jumlah kondisi jalan
                    this.jumlahKondisiJalan = this.countKondisiJalan();


                    this.displayDataOnMap();
                } else {
                    console.error('Format data tidak valid:', jalanData);
                }
            } catch (error) {
                console.error('Gagal mengambil data jalan:', error);
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

                    polyline.on('click', () => {
                        const eksisting = this.eksistingData[jalan.eksisting_id] || 'Unknown';
                        const jenisJalan = this.jenisJalanData[jalan.jenisjalan_id] || 'Unknown';
                        const desa = this.desaData[jalan.desa_id] || 'Unknown';

                        const popupContent = document.createElement('div');
                        popupContent.innerHTML = `
                            <strong class="mb-2">Nama Ruas:</strong> ${jalan.nama_ruas}<br>
                            <strong class="mb-2">Nama Desa:</strong> ${desa}<br>
                            <strong>Kondisi:</strong> ${kondisi}<br>
                            <strong>Lebar:</strong> ${jalan.lebar}<br>
                            <strong>Kode Ruas:</strong> ${jalan.kode_ruas}<br>
                            <strong>Eksisting:</strong> ${eksisting}<br>
                            <strong>Jenis Jalan:</strong> ${jenisJalan}<br>
                            <strong>Keterangan:</strong> ${jalan.keterangan}<br>
                            <strong>Panjang:</strong> ${jalan.panjang}<br>
                            <button id="edit-${jalan.id}" class="btn btn-primary">Edit</button>
                            <button id="delete-${jalan.id}" class="btn btn-danger">Delete</button>
                        `;

                        popupContent.querySelector(`#edit-${jalan.id}`).addEventListener('click', () => {
                            this.editPolyline(jalan.id);
                        });

                        popupContent.querySelector(`#delete-${jalan.id}`).addEventListener('click', () => {
                            this.deletePolyline(jalan.id);
                        });

                        polyline.bindPopup(popupContent).openPopup();
                    });
                } catch (error) {
                    console.error('Error parsing coordinate data:', error);
                }
            });
        },
        decompressCoordinate(compressedCoordinate) {
            const compressed = Uint8Array.from(atob(compressedCoordinate), c => c.charCodeAt(0));
            const decompressed = pako.inflate(compressed, { to: 'string' });
            return decompressed;
        },
        async editPolyline(id) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://gisapis.manpits.xyz/api/ruasjalan/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const ruasJalan = response.data.ruasjalan;

                this.openEditModal(ruasJalan);
            } catch (error) {
                console.error('Gagal mengambil data ruas jalan:', error);
            }
        },
        openEditModal(ruasJalan) {
            const modal = document.getElementById('editModal');

            modal.querySelector('#editNamaRuas').value = ruasJalan.nama_ruas;
            modal.querySelector('#editLebarRuas').value = ruasJalan.lebar;
            modal.querySelector('#editNamaDesa').value = ruasJalan.desa_id;
            modal.querySelector('#editKodeRuas').value = ruasJalan.kode_ruas;
            modal.querySelector('#editKeterangan').value = ruasJalan.keterangan;
            modal.querySelector('#editKondisi').value = ruasJalan.kondisi_id;
            modal.querySelector('#editEksisting').value = ruasJalan.eksisting_id;
            modal.querySelector('#editJenisJalan').value = ruasJalan.jenisjalan_id;

            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();

            modal.querySelector('#btnSimpanEdit').addEventListener('click', () => {
                const editedData = {
                    nama_ruas: modal.querySelector('#editNamaRuas').value,
                    lebar: modal.querySelector('#editLebarRuas').value,
                    lebar: modal.querySelector('#editNamaDesa').value,
                    kode_ruas: modal.querySelector('#editKodeRuas').value,
                    keterangan: modal.querySelector('#editKeterangan').value,
                    kondisi_id: modal.querySelector('#editKondisi').value,
                    eksisting_id: modal.querySelector('#editEksisting').value,
                    jenisjalan_id: modal.querySelector('#editJenisJalan').value
                };

                this.updatePolylineData(ruasJalan.id, editedData);
                bsModal.hide();
            });
        },
        async updatePolylineData(id, newData) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.put(`https://gisapis.manpits.xyz/api/ruasjalan/${id}`, newData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Data ruas jalan berhasil diperbarui:', response.data);
                alert('Data ruas jalan berhasil diperbarui');
                this.fetchJalanData();
            } catch (error) {
                console.error('Gagal memperbarui data ruas jalan:', error);
                alert('Gagal memperbarui data ruas jalan');
            }
        },
        async deletePolyline(id) {
            try {
                console.log(`Menghapus polyline dengan ID: ${id}`);
                const token = localStorage.getItem('token');
                const response = await axios.delete(`https://gisapis.manpits.xyz/api/ruasjalan/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Response:', response);
                alert('Polyline berhasil dihapus');
                this.fetchJalanData();
            } catch (error) {
                console.error('Gagal menghapus polyline:', error);
                alert('Gagal menghapus polyline');
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
                alert('Nama ruas tidak ditemukan.');
            }
        },
        countJenisJalan() {
            const jumlahJenisJalan = {
                Kabupaten: 0,
                Desa: 0,
                Provinsi: 0
            };

            this.jalanData.forEach(jalan => {
                const jenisJalan = this.jenisJalanData[jalan.jenisjalan_id] || 'Unknown';
                if (jenisJalan === 'Kabupaten') jumlahJenisJalan.Kabupaten++;
                else if (jenisJalan === 'Desa') jumlahJenisJalan.Desa++;
                else if (jenisJalan === 'Provinsi') jumlahJenisJalan.Provinsi++;
            });

            return jumlahJenisJalan;
        },

        countKondisiJalan() {
            const jumlahKondisiJalan = {
                Rusak: 0,
                Bagus: 0,
                Sedang: 0
            };

            this.jalanData.forEach(jalan => {
                const kondisi = this.kondisiData[jalan.kondisi_id] || 'Unknown';
                if (kondisi === 'Rusak') jumlahKondisiJalan.Rusak++;
                else if (kondisi === 'Baik') jumlahKondisiJalan.Bagus++;
                else if (kondisi === 'Sedang') jumlahKondisiJalan.Sedang++;
            });

            return jumlahKondisiJalan;
        },
        toggleJumlahData() {
            this.showJumlahData = !this.showJumlahData;
        }
    }
};
</script>

<style>
#map {
    height: 600px;
}
</style>
