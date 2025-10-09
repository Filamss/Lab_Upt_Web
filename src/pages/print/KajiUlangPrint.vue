<template>
  <FormPrint
    :data="formMeta"
    :showBlankArea="true"
    :signatures="data?.signatures || []"
  >
    <div class="print-container">
      <!-- === DATA PEMESAN === -->
      <table class="info-table">
        <tbody>
          <tr>
            <td>No. Order</td>
            <td>: {{ data?.orderNo || '-' }}</td>
          </tr>
          <tr>
            <td>No. Sampel</td>
            <td>: {{ data?.sampleNo || '-' }}</td>
          </tr>
          <tr>
            <td>Tanggal</td>
            <td>: {{ data?.date || '-' }}</td>
          </tr>
          <tr>
            <td>Nama Customer</td>
            <td>: {{ data?.customerName || '-' }}</td>
          </tr>
          <tr>
            <td>Alamat</td>
            <td>: {{ data?.address || '-' }}</td>
          </tr>
          <tr>
            <td>Jenis Pengujian</td>
            <td>: {{ data?.testType || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- EVALUASI -->
      <table class="border-table mt-2">
        <thead>
          <tr>
            <th style="width: 5%">No</th>
            <th>PERIHAL</th>
            <th style="width: 30%">HASIL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in data?.kajiUlangRows || []" :key="i">
            <td class="text-center">{{ i + 1 }}</td>
            <td>{{ row.perihal }}</td>
            <td class="text-center">{{ row.hasil || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="notes mt-2">
        <strong>CATATAN:</strong>
        <div class="note-box">{{ data?.note || '' }}</div>
      </div>
    </div>
  </FormPrint>
</template>

<script setup>
import { computed } from 'vue';
import FormPrint from './FormPrint.vue';

const props = defineProps({
  data: { type: Object, required: true },
});

const formMeta = computed(() => {
  const d = props.data || {};
  return {
    formTitle: d.formTitle || 'KAJI ULANG PERMINTAAN',
    docNo: d.docNo || d.noDok || 'F/UPT-LAB/7.1-1',
    tertRev: d.tertRev || '1/1',
    tglTerbit: d.tglTerbit || d.date || '-',
    tglRev: d.tglRev || '-',
    noVol: d.noVol || '-',
    hal: d.hal || '-',
  };
});
</script>

<style scoped>
@page {
  size: A4;
  margin: 15mm;
}

body {
  font-family: 'Times New Roman', serif;
  color: #000;
  background: white;
}

.print-container {
  width: 100%;
  border: 1px solid #000;
  padding: 10px;
}

/* === KOP SURAT === */
.kop-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  text-align: center;
  font-size: 11pt;
}

.kop-table td {
  border: 1px solid #000;
  padding: 3px;
  vertical-align: middle;
}

.logo {
  width: 90px;
  height: auto;
  display: block;
  margin: 5px auto;
}

.instansi {
  text-align: center;
  font-size: 11pt;
  font-weight: bold;
  line-height: 1.4;
}

.judul-form,
.judul-sub {
  font-weight: bold;
  font-size: 12pt;
}

.meta-left {
  text-align: left;
  padding-left: 6px;
  font-size: 10pt;
}

/* === TABLES === */
.info-table,
.border-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11pt;
  margin-top: 8px;
}

.border-table th,
.border-table td {
  border: 1px solid #000;
  padding: 4px;
}

.border-table th {
  text-align: center;
}

/* === CATATAN === */
.notes .note-box {
  border: 1px solid #000;
  height: 60px;
  margin-top: 4px;
}

.footnote {
  font-size: 9pt;
  font-style: italic;
  margin-top: 2px;
}

/* === SIGNATURES === */
.signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.sig {
  width: 40%;
}

.sig .spacer {
  height: 60px;
}
</style>
