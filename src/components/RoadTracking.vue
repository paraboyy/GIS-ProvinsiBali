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
                                <label for="editLebarRuas" class="form-label">Lebar Ruas</label>
                                <input type="number" class="form-control" id="editLebarRuas">
                            </div>
                            <div class="mb-3">
                                <label for="editKodeRuas" class="form-label">Kode Ruas</label>
                                <input type="text" class="form-control" id="editKodeRuas">
                            </div>
                            <div class="mb-3">
                                <label for="editKeterangan" class="form-label">Keterangan</label>
                                <input type="text" class="form-control" id="editKeterangan">
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

const emitter = mitt();

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

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

                        const popupContent = document.createElement('div');
                        popupContent.innerHTML = `
                            <strong>Nama Ruas:</strong> ${jalan.nama_ruas}<br>
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
                console.log(response.data.ruasJalan);

                this.openEditModal(ruasJalan);
            } catch (error) {
                console.error('Gagal mengambil data ruas jalan:', error);
            }
        },
        openEditModal(ruasJalan) {
            const modal = document.getElementById('editModal');
            // console.log(ruasJalan);

            modal.querySelector('#editNamaRuas').value = ruasJalan.nama_ruas;
            modal.querySelector('#editLebarRuas').value = ruasJalan.lebar;
            modal.querySelector('#editKodeRuas').value = ruasJalan.kode_ruas;
            modal.querySelector('#editKeterangan').value = ruasJalan.keterangan;

            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();

            modal.querySelector('#btnSimpanEdit').addEventListener('click', () => {
                const editedData = {
                    nama_ruas: modal.querySelector('#editNamaRuas').value,
                    lebar: modal.querySelector('#editLebarRuas').value,
                    kode_ruas: modal.querySelector('#editKodeRuas').value,
                    keterangan: modal.querySelector('#editKeterangan').value
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
        }
    }
};
</script>

<style>
#map {
    height: 600px;
}
</style>
