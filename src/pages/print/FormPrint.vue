<template>
  <div class="form-print-root">
    <div class="page-frame">
      <table class="kop-table">
        <tbody>
          <tr>
            <td class="logo-cell" style="width: 18%; text-align: left">
              <img :src="logoDinas" alt="Logo" class="logo" />
            </td>
            <td class="instansi-cell" colspan="6">
              <div class="instansi">
                <div><strong>UPT</strong></div>
                <div><strong>LABORATORIUM PERINDUSTRIAN</strong></div>
                <div><strong>KABUPATEN TEGAL</strong></div>
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="7" class="judul-form">FORMULIR</td>
          </tr>
          <tr>
            <td colspan="7" class="judul-sub">
              {{ data?.formTitle || 'JUDUL DOKUMEN' }}
            </td>
          </tr>
          <tr>
            <td colspan="2" class="meta-left">
              No. Dok: {{ data?.docNo || data?.noDok || '-' }}
            </td>
            <td>Tert/Rev:<br />{{ data?.tertRev || '-' }}</td>
            <td>Tgl. Terbit:<br />{{ data?.tglTerbit || '-' }}</td>
            <td>Tgl. Rev:<br />{{ data?.tglRev || '-' }}</td>
            <td>No. Vol/Bag:<br />{{ data?.noVol || '-' }}</td>
            <td>Hal:<br />{{ data?.hal || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- large blank area (for signatures/notes as in provided image) -->
      <div class="blank-area mt-2">
        <!-- Optionally show some header rows if provided -->
        <div v-if="data?.headerRows" class="header-rows">
          <table class="info-table">
            <tbody>
              <tr v-for="(r, i) in data.headerRows" :key="i">
                <td style="width: 20%">{{ r.label }}</td>
                <td>: {{ r.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="showBlankArea" class="blank-box">
          <!-- allow document-specific content to be injected here -->
          <slot />
        </div>

        <div class="sign-lines mt-4">
          <div
            class="sig-block"
            v-for="(s, i) in signatures && signatures.length
              ? signatures
              : defaultSignatures"
            :key="i"
          >
            <div class="sig-label">{{ s.label }}</div>
            <div class="sig-line-underline">&nbsp;</div>
            <div class="sig-dots">
              {{ s.name || '................................................' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logoDinas from '@/assets/logo-dinas.jpg';

defineProps({
  data: { type: Object, required: false },
  showBlankArea: { type: Boolean, default: true },
  signatures: { type: Array, required: false },
});

const defaultSignatures = [
  { label: 'Customer', name: '' },
  { label: 'Administrasi', name: '' },
];
</script>

<style scoped>
@page {
  size: A4;
  margin: 12mm;
}
.form-print-root {
  font-family: 'Times New Roman', serif;
  color: #000;
  background: white;
}
.page-frame {
  border: 2px solid #000;
  padding: 8px;
}
.kop-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 11pt;
}
.kop-table td {
  border: 1px solid #000;
  padding: 4px;
  vertical-align: middle;
}
.logo {
  width: 70px;
  display: block;
  margin: 4px;
}
.instansi {
  text-align: center;
  font-weight: bold;
  line-height: 1.3;
}
.judul-form,
.judul-sub {
  text-align: center;
  font-weight: bold;
}
.judul-form {
  font-size: 12pt;
}
.judul-sub {
  font-size: 13pt;
}
.meta-left {
  text-align: left;
  padding-left: 6px;
}
.blank-area {
  margin-top: 8px;
}
.blank-box {
  border: 1px solid #000;
  height: 540px; /* match tall blank area in sample image */
  margin-top: 6px;
  padding: 10px;
  box-sizing: border-box;
  background: white;
}
.sign-lines {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
.sig-block {
  width: 40%;
  text-align: center;
}
.sig-label {
  margin-bottom: 12px;
}
.sig-line-underline {
  height: 60px;
}
.sig-dots {
  margin-top: 6px;
}

@media print {
  body {
    background: white !important;
  }
}
</style>
