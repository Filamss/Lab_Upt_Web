<template>
  <FormPrint :data="formMeta" :showBlankArea="true" :signatures="data?.signatures || []">
    <div class="print-container">
      <section class="info-section">
        <table class="info-table">
          <tbody>
            <tr>
              <td class="label">ID Order</td>
              <td>: {{ data?.orderNo || '-' }}</td>
            </tr>
            <tr>
              <td class="label">No. Order</td>
              <td>: {{ orderNumberDisplay }}</td>
            </tr>
            <tr>
              <td class="label">Tanggal</td>
              <td>: {{ data?.date || '-' }}</td>
            </tr>
            <tr>
              <td class="label">Nama Customer</td>
              <td>: {{ data?.customerName || '-' }}</td>
            </tr>
            <tr>
              <td class="label">Kontak</td>
              <td>: {{ data?.customerPhone || data?.phoneNumber || '-' }}</td>
            </tr>
            <tr>
              <td class="label">Alamat</td>
              <td>: {{ data?.customerAddress || data?.address || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="mt-3">
        <table class="detail-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Pengujian</th>
              <th>Kode</th>
              <th>Jumlah</th>
              <th>No. Sampel</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in testItems" :key="idx">
              <td class="text-center">{{ idx + 1 }}</td>
              <td>{{ item.testName || '-' }}</td>
              <td class="text-center">{{ resolveTestCode(item) }}</td>
              <td class="text-center">{{ item.quantity || '-' }}</td>
              <td>{{ sampleCode(item) }}</td>
            </tr>
            <tr v-if="!testItems.length">
              <td colspan="5" class="text-center">Data pengujian belum tersedia.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="mt-3">
        <h4 class="section-title">Catatan</h4>
        <div class="note-box">{{ data?.note || '-' }}</div>
      </section>
    </div>
  </FormPrint>
</template>

<script setup>
import { computed } from 'vue'
import FormPrint from './FormPrint.vue'

const props = defineProps({
  data: { type: Object, required: true },
})

const baseData = computed(() => props.data || {})

const formMeta = computed(() => {
  const d = baseData.value
  return {
    formTitle: d.formTitle || 'KAJI ULANG PERMINTAAN',
    docNo: d.docNo || d.noDok || 'F/UPT-LAB/7.1-1',
    tertRev: d.tertRev || '1/1',
    tglTerbit: d.tglTerbit || d.date || '-',
    tglRev: d.tglRev || '-',
    noVol: d.noVol || '-',
    hal: d.hal || '-',
  }
})

const resolveDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const orderYear = computed(() => {
  const d = baseData.value
  if (d.orderYear) return String(d.orderYear)
  const date = resolveDate(d.date)
  return date ? String(date.getFullYear()) : ''
})

const orderNumberDisplay = computed(() => {
  const number = baseData.value.orderNumber
  if (!number) return '-'
  return orderYear.value ? ${number}/ : String(number)
})

const monthYearLabel = computed(() => {
  const date = resolveDate(baseData.value.date)
  if (date) {
    return ${String(date.getMonth() + 1).padStart(2, '0')}/
  }
  const year = orderYear.value || String(new Date().getFullYear())
  const now = new Date()
  return ${String(now.getMonth() + 1).padStart(2, '0')}/
})

const testItems = computed(() => baseData.value.testItems || [])

const resolveTestCode = (item) => {
  if (!item) return '--'
  if (item.testCode) return item.testCode
  if (item.testId) return String(item.testId).split('-')[0]
  return '--'
}

const sampleCode = (item) => {
  const orderNo = baseData.value.orderNumber ? String(baseData.value.orderNumber) : '--'
  const code = resolveTestCode(item)
  const sampleRaw = item?.sampleNo ?? baseData.value.sampleNo
  const sampleVal = sampleRaw && String(sampleRaw).trim() ? String(sampleRaw).trim() : '--'
  return ${monthYearLabel.value}.//
}
</script>

<style scoped>
.print-container {
  width: 100%;
  padding: 12px;
  border: 1px solid #000;
  font-family: 'Times New Roman', serif;
  color: #000;
}

.info-table,
.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11pt;
}

.info-table td {
  padding: 4px 6px;
  vertical-align: top;
}

.info-table .label {
  width: 160px;
  font-weight: 600;
}

.detail-table th,
.detail-table td {
  border: 1px solid #000;
  padding: 4px;
}

.detail-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.text-center {
  text-align: center;
}

.section-title {
  font-size: 11pt;
  font-weight: 600;
  margin-bottom: 4px;
}

.note-box {
  border: 1px solid #000;
  min-height: 60px;
  padding: 6px;
}

.mt-3 {
  margin-top: 12px;
}
</style>
