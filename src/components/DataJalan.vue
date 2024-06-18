<template>
    <div class="background" style="height: 100%">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" aria-current="page" href="/homelogin">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/create">Tambah Ruas Jalan</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/road">Detail Jalan</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="#">Data Jalan</a>
                        </li>
                    </ul>
                    <button class="btn btn-danger m-2"><a href="/"
                            class="d-flex text-white align-items-center">Logout</a></button>
                </div>
                <a class="navbar-brand" href="#">
                    <img src="https://www.baliprov.go.id/assets/img/nav_bar.png" alt="Logo" width="30" height="30"
                        class="d-inline-block align-top">
                    GIS || Provinsi Bali
                </a>
            </div>
        </nav>

        <div class="dp-flex justify-content-center">
            <div class="w-20 px-5 pt-3">
                <div class="bg-danger p-3 br-1 shadow-1">
                    <p class="text-center fs-4">Rusak</p>
                    <p class="text-center fs-5">{{ jumlahKondisiJalan.Rusak }} ({{ (jumlahKondisiJalan.Rusak /
                        dataruasjalan.length *
                        100).toFixed(2) }}%)</p>
                </div>
            </div>

            <div class="w-20 px-5 pt-3">
                <div class="bg-warning p-3 br-1 shadow-1">
                    <p class="text-center fs-4">Sedang</p>
                    <p class="text-center fs-5">{{ jumlahKondisiJalan.Sedang }} ({{ (jumlahKondisiJalan.Sedang /
                        dataruasjalan.length *
                        100).toFixed(2) }}%)</p>
                </div>
            </div>

            <div class="w-20 px-5 pt-3">
                <div class="bg-info p-3 br-1 shadow-1">
                    <p class="text-center fs-4">Bagus</p>
                    <p class="text-center fs-5">{{ jumlahKondisiJalan.Bagus }} ({{ (jumlahKondisiJalan.Bagus /
                        dataruasjalan.length *
                        100).toFixed(2) }}%)</p>
                </div>
            </div>
        </div>

        <div class="mt-5 mx-5 p-5 shadow-3 bg-light mb-5 br-1">
            <input type="text" v-model="searchQuery"
                placeholder="Cari berdasarkan Nama Ruas, Eksisting, Kondisi Jalan, atau Jenis Jalan"
                class="form-control mb-4">
            <div v-if="filteredData.length">
                <table class="table table-hover table-bordered">
                    <thead class="table-primary">
                        <tr>
                            <th scope="col">Nama Desa</th>
                            <th scope="col">Nama Ruas</th>
                            <th scope="col">Panjang Jalan</th>
                            <th scope="col">Lebar Jalan</th>
                            <th scope="col">Eksisting</th>
                            <th scope="col">Kondisi Jalan</th>
                            <th scope="col">Jenis Jalan</th>
                            <th scope="col">Keterangan</th>
                            <th scope="col">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="jalan in paginatedData" :key="jalan.id">
                            <td>{{ getNamaDesa(jalan.desa_id) }}</td>
                            <td>{{ jalan.nama_ruas }}</td>
                            <td>{{ jalan.panjang }}</td>
                            <td>{{ jalan.lebar }}</td>
                            <td>{{ getNamaEksisting(jalan.eksisting_id) }}</td>
                            <td>{{ getNamaKondisi(jalan.kondisi_id) }}</td>
                            <td>{{ getNamaJenisJalan(jalan.jenisjalan_id) }}</td>
                            <td>{{ jalan.keterangan }}</td>
                            <td class="dp-in-grid">
                                <button class="btn btn-primary mt-2 shadow"
                                    @click="editRuasJalan(jalan.id)">Edit</button>
                                <button class="btn btn-danger mt-2 shadow"
                                    @click="deleteRuasJalan(jalan.id)">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="pagination justify-content-center">
                    <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
                    <span class="text-dark">Page {{ currentPage }} of {{ totalPages }}</span>
                    <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            dataruasjalan: [],
            desas: [],
            eksistings: [],
            kondisis: [],
            jenisJalans: [],
            currentPage: 1,
            jumlahKondisiJalan: {},
            pageSize: 10,
            kondisiData: {},
            searchQuery: '' // Tambahkan properti untuk query pencarian
        }
    },
    computed: {
        filteredData() {
            if (!this.searchQuery) return this.dataruasjalan;
            return this.dataruasjalan.filter(jalan => {
                const namaRuas = jalan.nama_ruas.toLowerCase();
                const eksisting = this.getNamaEksisting(jalan.eksisting_id).toLowerCase();
                const kondisi = this.getNamaKondisi(jalan.kondisi_id).toLowerCase();
                const jenisJalan = this.getNamaJenisJalan(jalan.jenisjalan_id).toLowerCase();
                const query = this.searchQuery.toLowerCase();

                return (
                    namaRuas.includes(query) ||
                    eksisting.includes(query) ||
                    kondisi.includes(query) ||
                    jenisJalan.includes(query)
                );
            });
        },
        paginatedData() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.filteredData.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredData.length / this.pageSize);
        }
    },
    created() {
        this.fetchDataJalan();
        this.fetchDesas();
        this.fetchEksistings();
        this.fetchKondisis();
        this.fetchJenisJalans();
    },
    methods: {
        async fetchDataJalan() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/ruasjalan', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const dataruasjalan = response.data.ruasjalan;


                if (Array.isArray(dataruasjalan)) {
                    this.dataruasjalan = dataruasjalan;
                    // Hitung jumlah kondisi jalan
                    this.jumlahKondisiJalan = this.countKondisiJalan();

                } else {
                    console.error('Format data tidak valid:', dataruasjalan);
                }
            } catch (error) {
                console.error(error);
            }
        },
        async fetchDesas() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mregion', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.desas = response.data.desa;
            } catch (error) {
                console.error(error);
            }
        },
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

                this.kondisis.forEach(item => {
                    this.kondisiData[item.id] = item.kondisi;
                });
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
        getNamaDesa(id) {
            const desa = this.desas.find(d => d.id === id);
            return desa ? desa.desa : 'Tidak ditemukan';
        },
        getNamaEksisting(id) {
            const eksisting = this.eksistings.find(e => e.id === id);
            return eksisting ? eksisting.eksisting : 'Tidak ditemukan';
        },
        getNamaKondisi(id) {
            const kondisi = this.kondisis.find(k => k.id === id);
            return kondisi ? kondisi.kondisi : 'Tidak ditemukan';
        },
        getNamaJenisJalan(id) {
            const jenisJalan = this.jenisJalans.find(j => j.id === id);
            return jenisJalan ? jenisJalan.jenisjalan : 'Tidak ditemukan';
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        editRuasJalan(id) {
            localStorage.setItem('id', id);
            this.$router.push({ name: 'EditRuasJalan', params: { id } });
        },
        async deleteRuasJalan(id) {
            Swal.fire({
                title: "Apakah Anda yakin?",
                text: "Anda tidak akan dapat mengembalikannya!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Ya, hapus saja!"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const token = localStorage.getItem('token');
                        await axios.delete(`https://gisapis.manpits.xyz/api/ruasjalan/${id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        this.fetchDataJalan();
                        Swal.fire({
                            title: "Terhapus!",
                            text: "Data jalan telah dihapus.",
                            icon: "success"
                        });
                    } catch (error) {
                        console.error(error);
                        Swal.fire({
                            title: "Error!",
                            text: "Terjadi kesalahan saat menghapus data.",
                            icon: "error"
                        });
                    }
                }
            });
        },
        countKondisiJalan() {
            const jumlahKondisiJalan = {
                Rusak: 0,
                Bagus: 0,
                Sedang: 0
            };

            this.dataruasjalan.forEach(jalan => {
                const kondisi = this.kondisiData[jalan.kondisi_id] || 'Unknown';
                console.log(kondisi);
                if (kondisi === 'Rusak') jumlahKondisiJalan.Rusak++;
                else if (kondisi === 'Baik') jumlahKondisiJalan.Bagus++;
                else if (kondisi === 'Sedang') jumlahKondisiJalan.Sedang++;
            });

            return jumlahKondisiJalan;
        },
    }
}
</script>
