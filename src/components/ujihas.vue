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

            this.tileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
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
                            <button id="edit-${jalan.id}">Edit</button>
                            <button id="delete-${jalan.id}">Delete</button>
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
            alert(`Edit polyline dengan ID: ${id}`);
            // Implementasikan logika untuk memperbarui polyline di sini
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
