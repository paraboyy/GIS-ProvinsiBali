<template>
    <div class="background min-height" style="height: 100%">
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
                        <!-- <li class="nav-item">
                            <a class="nav-link" href="/road">Detail Jalan</a>
                        </li> -->
                        <li class="nav-item">
                            <a class="nav-link active" href="#">Data Jalan</a>
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

        <div v-if="showPersentaseDialog" class="dialog-filter dp-flex p-5 justify-content-center">
            <div class="w-20 px-2 mt-2 pt-3" v-if="showKondisiJalanData">
                <div class="bg-light p-3 br-1 shadow-1 b-2w">
                    <p class="text-start fs-4">Persentase Kondisi Jalan</p>
                </div>
            </div>

            <div class="w-20 px-2 pt-3 dialog-filter" v-if="showKondisiJalanData">
                <div class="bg-danger p-3 br-1 shadow-1 b-2w">
                    <p class="text-center fs-4">Jalan Rusak</p>
                    <p class="text-center fs-5">{{ jumlahKondisiJalan.Rusak }} ({{ (jumlahKondisiJalan.Rusak /
                        dataruasjalan.length *
                        100).toFixed(2) }}%)</p>
                </div>
            </div>

            <div class="w-20 px-2 pt-3" v-if="showKondisiJalanData">
                <div class="bg-warning p-3 br-1 shadow-1 b-2w">
                    <p class="text-center fs-4">Jalan Sedang</p>
                    <p class="text-center fs-5">{{ jumlahKondisiJalan.Sedang }} ({{ (jumlahKondisiJalan.Sedang /
                        dataruasjalan.length *
                        100).toFixed(2) }}%)</p>
                </div>
            </div>

            <div class="w-20 px-2 pt-3" v-if="showKondisiJalanData">
                <div class="bg-info p-3 br-1 shadow-1 b-2w">
                    <p class="text-center fs-4">Jalan Bagus</p>
                    <p class="text-center fs-5">{{ jumlahKondisiJalan.Bagus }} ({{ (jumlahKondisiJalan.Bagus /
                        dataruasjalan.length *
                        100).toFixed(2) }}%)</p>
                </div>
            </div>

            <div class="w-20 px-2 mt-2 pt-3" v-if="showJenisJalanData">
                <div class="bg-light p-3 br-1 shadow-1 b-2w">
                    <p class="text-start fs-4">Persentase Jenis Jalan</p>
                </div>
            </div>

            <div class="w-20 px-2 pt-3" v-if="showJenisJalanData">
                <div class="bg-info p-3 br-1 shadow-1 b-2w">
                    <p class="text-center fs-4">Desa</p>
                    <p class="text-center fs-5">{{ jumlahJenisJalan.Desa }} ({{ (jumlahJenisJalan.Desa /
                        dataruasjalan.length *
                        100).toFixed(2) }}%)</p>
                </div>
            </div>

            <div class="w-20 px-2 pt-3" v-if="showJenisJalanData">
                <div class="bg-warning p-3 br-1 shadow-1 b-2w">
                    <p class="text-center fs-4">Kabupaten</p>
                    <p class="text-center fs-5">{{ jumlahJenisJalan.Kabupaten }} ({{ (jumlahJenisJalan.Kabupaten /
                        dataruasjalan.length *
                        100).toFixed(2) }}%)</p>
                </div>
            </div>

            <div class="w-20 px-2 pt-3" v-if="showJenisJalanData">
                <div class="bg-danger p-3 br-1 shadow-1 b-2w">
                    <p class="text-center fs-4">Provinsi</p>
                    <p class="text-center fs-5">{{ jumlahJenisJalan.Provinsi }} ({{ (jumlahJenisJalan.Provinsi /
                        dataruasjalan.length *
                        100).toFixed(2) }}%)</p>
                </div>
            </div>

            <div class="w-20 px-5 pt-3">
                <button class="btn btn-primary mt-4 shadow-2 px-4" @click="showJenisJalan">Jenis Jalan</button>
                <button class="btn btn-success mt-3 shadow-2 px-3" @click="showKondisiJalan">Kondisi Jalan</button>
            </div>
        </div>

        <div class="mt-5 mx-5 p-4 shadow-3 bg-light mb-2 br-1">
            <div class="dp-flex">
                <input type="text" v-model="searchQuery"
                    placeholder="Cari berdasarkan Nama Ruas, Eksisting, Kondisi Jalan, atau Jenis Jalan"
                    class="form-control">
                <button class="btn btn-warning ms-3 shadow-2" @click="togglePersentaseDialog">Munculkan Data
                    Persentase</button>
                <button class="btn btn-info ms-3 shadow-2" @click="toggleFilterDialog">Filter</button>
            </div>

            <div v-if="showFilterDialog" class="filter-dialog p-3 mb-4 mt-4 bg-light shadow-2 br-1 row">
                <h5>Filter Data</h5>
                <div class="mb-2 w-50">
                    <label for="filter-kondisi">Kondisi Jalan:</label>
                    <select id="filter-kondisi" v-model="filterKondisi" class="form-select">
                        <option value="">Semua</option>
                        <option value="Rusak">Rusak</option>
                        <option value="Baik">Baik</option>
                        <option value="Sedang">Sedang</option>
                    </select>
                </div>
                <div class="mb-2 w-50">
                    <label for="filter-jenis">Jenis Jalan:</label>
                    <select id="filter-jenis" v-model="filterJenis" class="form-select">
                        <option value="">Semua</option>
                        <option value="Desa">Desa</option>
                        <option value="Kabupaten">Kabupaten</option>
                        <option value="Provinsi">Provinsi</option>
                    </select>
                </div>
                <div class="mb-2 w-50">
                    <label for="filter-desa">Desa:</label>
                    <select id="filter-desa" v-model="filterDesa" class="form-select">
                        <option value="">Semua</option>
                        <option v-for="desa in desas" :key="desa.id" :value="desa.desa">{{ desa.desa }}</option>
                    </select>
                </div>
                <div class="mb-2 w-50">
                    <label for="filter-eksisting">Eksisting:</label>
                    <select id="filter-eksisting" v-model="filterEksisting" class="form-select">
                        <option value="">Semua</option>
                        <option v-for="eksisting in eksistings" :key="eksisting.id" :value="eksisting.eksisting">{{
                            eksisting.eksisting }}</option>
                    </select>
                </div>
                <button class="btn btn-success shadow-2" style="width: 15%;" @click="applyFilter">Terapkan
                    Filter</button>
                <button class="btn btn-danger ms-2 shadow-2" style="width: 15%;" @click="resetFilter">Reset</button>
            </div>
        </div>

        <div class="mt-2 mx-5 p-5 shadow-3 bg-light mb-5 br-1">
            <div v-if="filteredData.length">
                <table class="table table-hover table-bordered">
                    <thead class="table-primary">
                        <tr>
                            <th scope="col">No</th>
                            <!-- <th scope="col">Nama Kabupaten</th> -->
                            <!-- <th scope="col">Nama Kecamatan</th> -->
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
                        <tr v-for="(jalan, index) in paginatedData" :key="jalan.id">
                            <td>{{ index + 1 }}</td>
                            <!-- <td>{{ getNamaKabupaten(jalan.kabupaten_id) }}</td> -->
                            <!-- <td>{{ getNamaKecamatan(jalan.desa_id) }}</td> -->
                            <td>{{ getNamaDesa(jalan.desa_id) }}</td>
                            <td>{{ jalan.nama_ruas }}</td>
                            <td>{{ Math.floor(jalan.panjang) }} M</td>
                            <td>{{ jalan.lebar }} M</td>
                            <td>{{ getNamaEksisting(jalan.eksisting_id) }}</td>
                            <td>{{ getNamaKondisi(jalan.kondisi_id) }}</td>
                            <td>{{ getNamaJenisJalan(jalan.jenisjalan_id) }}</td>
                            <td>{{ jalan.keterangan }}</td>
                            <td class="dp-in-grid">
                                <button class="btn btn-warning mt-2 shadow" @click="editRuasJalan(jalan.id)"><i
                                        class="bi bi-pencil-fill"></i></button>
                                <button class="btn btn-danger mt-2 shadow" @click="deleteRuasJalan(jalan.id)"> <i
                                        class="bi bi-trash-fill"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="pagination justify-content-center">
                    <button class="shadow-2" @click="prevPage" :disabled="currentPage === 1">Previous</button>
                    <span class="text-dark">Page {{ currentPage }} of {{ totalPages }}</span>
                    <button class="shadow-2" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default {
    data() {
        return {
            nomor: 1,
            datas: '',
            dataruasjalan: [],
            desas: [],
            eksistings: [],
            kondisis: [],
            jenisJalans: [],
            currentPage: 1,
            jumlahKondisiJalan: {},
            jumlahJenisJalan: {},
            pageSize: 10,
            kondisiData: {},
            searchQuery: '',
            showJenisJalanData: false,
            showKondisiJalanData: true,
            showFilterDialog: false,
            showPersentaseDialog: false,
            filterKondisi: '',
            filterJenis: '',
            filterDesa: '',
            filterEksisting: '',
            kecamatans: [],
            filterKecamatan: '',
            kabupatens: [],
        }
    },
    computed: {
        filteredData() {
            let filtered = this.dataruasjalan;

            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(jalan => {
                    const namaRuas = jalan.nama_ruas.toLowerCase();
                    const eksisting = this.getNamaEksisting(jalan.eksisting_id).toLowerCase();
                    const kondisi = this.getNamaKondisi(jalan.kondisi_id).toLowerCase();
                    const jenisJalan = this.getNamaJenisJalan(jalan.jenisjalan_id).toLowerCase();
                    const namaDesa = this.getNamaDesa(jalan.desa_id).toLowerCase();
                    const namaKabupaten = this.getNamaKabupaten(jalan.kabupaten_id).toLowerCase();
                    const namaKecamatan = this.getNamaKecamatanFilter(jalan.kecamatan_id).toLowerCase();

                    return (
                        namaRuas.includes(query) ||
                        eksisting.includes(query) ||
                        kondisi.includes(query) ||
                        jenisJalan.includes(query) ||
                        namaDesa.includes(query) ||
                        namaKabupaten.includes(query) ||
                        namaKecamatan.includes(query)
                    );
                });
            }

            if (this.filterKondisi) {
                filtered = filtered.filter(jalan => this.getNamaKondisi(jalan.kondisi_id) === this.filterKondisi);
            }

            if (this.filterJenis) {
                filtered = filtered.filter(jalan => this.getNamaJenisJalan(jalan.jenisjalan_id) === this.filterJenis);
            }

            if (this.filterDesa) {
                filtered = filtered.filter(jalan => this.getNamaDesa(jalan.desa_id) === this.filterDesa);
            }

            if (this.filterEksisting) {
                filtered = filtered.filter(jalan => this.getNamaEksisting(jalan.eksisting_id) === this.filterEksisting);
            }

            if (this.filterKecamatan) {
                filtered = filtered.filter(jalan => this.getNamaKecamatanFilter(jalan.kecamatan_id) === this.filterKecamatan);
            }

            return filtered;
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
        this.fetchKabupatens();
    },
    methods: {
        async fetchKabupatens() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://gisapis.manpits.xyz/api/mregion', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.kabupatens = response.data.kabupaten;
                this.kecamatans = response.data.kecamatan;
            } catch (error) {
                console.error(error);
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
                return response.data.kecamatan.kecamatan;
            } catch (error) {
                console.error('Gagal mengambil data kecamatan berdasarkan desa', error);
                throw error;
            }
        },
        getNamaKabupaten(id) {
            const kabupaten = this.kabupatens.find(k => k.id === id);
            return kabupaten ? kabupaten.kabupaten : 'Tidak ditemukan';
        },
        async getNamaKecamatan(desaId) {
            try {
                const kecamatan = await this.fetchKecamatanByDesaId(desaId);
                const dataKecamatan = this.kecamatans.find(k => k.kecamatan === kecamatan);
                console.log('Data:', kecamatan);
                console.log('Data:', dataKecamatan);
                return dataKecamatan ? dataKecamatan : 'Tidak ditemukan';
            } catch (error) {
                console.error('Error fetching kecamatan:', error);
                return 'Error';
            }
        },
        getNamaKecamatanFilter(id) {
            const kecamatan = this.kecamatans.find(k => k.id === id);
            return kecamatan ? kecamatan.kecamatan : 'Tidak ditemukan';
        },
        toggleFilterDialog() {
            this.showFilterDialog = !this.showFilterDialog;
        },
        togglePersentaseDialog() {
            this.showPersentaseDialog = !this.showPersentaseDialog;
        },
        applyFilter() {
            this.currentPage = 1; // Reset to the first page
            this.showFilterDialog = false;
        },
        resetFilter() {
            this.filterKondisi = '';
            this.filterJenis = '';
            this.filterDesa = '';
            this.filterEksisting = '';
            this.searchQuery = '';
            this.currentPage = 1;
        },
        showJenisJalan() {
            this.showJenisJalanData = true;
            this.showKondisiJalanData = false;
        },
        showKondisiJalan() {
            this.showJenisJalanData = false;
            this.showKondisiJalanData = true;
        },
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
                    this.jumlahJenisJalan = this.countJenisJalan();

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
        countJenisJalan() {
            const jumlahJenisJalan = {
                Desa: 0,
                Kabupaten: 0,
                Provinsi: 0
            };

            this.dataruasjalan.forEach(jalan => {
                const jenisJalan = this.jenisJalans.find(j => j.id === jalan.jenisjalan_id);
                const jenis = jenisJalan ? jenisJalan.jenisjalan : 'Unknown';

                if (jenis === 'Desa') jumlahJenisJalan.Desa++;
                else if (jenis === 'Kabupaten') jumlahJenisJalan.Kabupaten++;
                else if (jenis === 'Provinsi') jumlahJenisJalan.Provinsi++;
            });

            return jumlahJenisJalan;
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
        }
    }
}
</script>
