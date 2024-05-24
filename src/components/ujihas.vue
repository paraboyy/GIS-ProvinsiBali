<template>
    <div>
        <h2>Kompresi dan Dekompresi Koordinat</h2>
        <div>
            <label for="coordinate">Coordinate:</label>
            <textarea id="coordinate" v-model="coordinate"></textarea>
            <button @click="compressAndDecompress">Compress & Decompress</button>
        </div>
        <div v-if="compressedCoordinate">
            <h3>Koordinat Terkompresi:</h3>
            <p>{{ compressedCoordinate }}</p>
        </div>
        <div v-if="decompressedCoordinate">
            <h3>Koordinat Terdekompresi:</h3>
            <textarea v-model="decompressedCoordinate" readonly></textarea>
        </div>
    </div>
</template>

<script>
import pako from 'pako';

export default {
    data() {
        return {
            coordinate: '',
            compressedCoordinate: '',
            decompressedCoordinate: ''
        };
    },
    methods: {
        compressAndDecompress() {
            // Check if coordinate is not empty
            if (this.coordinate.trim() === '') {
                alert('Please enter a coordinate');
                return;
            }

            // Compress coordinate using pako
            const compressed = pako.deflate(this.coordinate, { to: 'string' });
            this.compressedCoordinate = btoa(compressed);

            // Decompress compressed coordinate
            const decompressed = pako.inflate(atob(this.compressedCoordinate), { to: 'string' });
            this.decompressedCoordinate = decompressed;

            // Compress decompressed coordinate again to revert it to original coordinate
            const recompressed = pako.deflate(decompressed, { to: 'string' });
            this.coordinate = recompressed;
        }
    }
};
</script>

<style>
/* Add your styles here if needed */
</style>
