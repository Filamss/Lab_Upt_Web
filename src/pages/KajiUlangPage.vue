<template>
  <div>
    <div v-if="!showForm">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Kaji Ulang Permintaan</h2>
        <button
          class="bg-gradient-to-r from-primaryLight to-primaryDark text-white px-4 py-2 rounded-lg"
          @click="addReview"
        >
          Tambah Kaji Ulang
        </button>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-xl shadow-md p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div class="flex-1">
          <input
            type="text"
            v-model="search"
            placeholder="Cari berdasarkan Order No"
            class="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </div>
        <div>
          <select
            v-model="statusFilter"
            class="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Semua Status</option>
            <option value="new">Telah dibuat</option>
            <option value="pending_validation">Sedang ditinjau</option>
            <option value="rejected">Dikembalikan</option>
            <option value="in_testing">Proses Pengujian</option>
            <option value="completed">Sertifikat Siap</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-md p-4">
        <table class="min-w-full text-sm border border-gray-200 ">
          <thead class="bg-muted">
            <tr>
              <th class="border-b px-3 py-2 text-left">Order No</th>
              <th class="border-b px-3 py-2 text-left">Sample No</th>
              <th class="border-b px-3 py-2 text-left">Tanggal</th>
              <th class="border-b px-3 py-2 text-left">Status</th>
              <th class="border-b px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in filteredOrderList"
              :key="order.id"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="border-b px-3 py-2">{{ order.orderNo }}</td>
              <td class="border-b px-3 py-2">{{ order.sampleNo }}</td>
              <td class="border-b px-3 py-2">{{ order.date }}</td>
              <td class="border-b px-3 py-2">{{ statusLabel(order.status) }}</td>
              <td class="border-b px-3 py-2 text-center">
                <button
                  class="p-1.5 rounded-md hover:bg-blue-50 text-primary hover:text-primaryDark transition"
                  @click="editReview(order)"
                  title="Edit"
                >
                  <PencilIcon class="w-5 h-5 inline" />
                </button>
                <button
                  class="p-1.5 rounded-md hover:bg-red-50 text-danger hover:text-red-700 transition"
                  @click="deleteReview(order)"
                  title="Hapus"
                >
                  <TrashIcon class="w-5 h-5 inline" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredOrderList.length === 0">
              <td colspan="5" class="px-3 py-4 text-center text-gray-500">
                Tidak ada data Kaji Ulang
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form -->
    <FormKajiUlang
      v-if="showForm"
      :form="form"
      :kajiUlangRows="reviewRows"
      :signatures="signatures"
      :tests="tests"
      :selectedCustomerAddress="selectedCustomerAddress"
      :getRowOptions="getRowOptions"
      @save-draft="saveDraft"
      @lolos-kaji-ulang="approveReview"
      @tolak="rejectReview"
      @close="showForm = false"
    />

    <FormPayment
      v-if="showPaymentModal"
      :tests="tests"
      :order-id="editingOrderId"
      @close="showPaymentModal = false"
      @payment-saved="onPaymentSaved"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/useOrderStore'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { useTestStore } from '@/stores/useTestStore'
import FormKajiUlang from '@/components/form/FormKajiUlang.vue'
import FormPayment from '@/components/form/FormPayment.vue'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const testStore = useTestStore()

const showForm = ref(false)
const showPaymentModal = ref(false)
const search = ref('')
const statusFilter = ref('')
const editingOrderId = ref(null)

const form = reactive({
  orderNo: '',
  sampleNo: '',
  date: new Date().toISOString().substr(0, 10),
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  testType: null,
  note: '',
})

const reviewRows = reactive([
  { topic: 'Peralatan', result: '' },
  { topic: 'Personel', result: '' },
  { topic: 'Waktu', result: '' },
  { topic: 'Kondisi', result: '' },
  { topic: 'Laboratorium Subkontrak', result: '' },
])

const signatures = reactive({ customer: null, admin: null })

const orderList = computed(() => orderStore.orders)
const filteredOrderList = computed(() =>
  orderList.value.filter((o) => {
    const matchesSearch = o.orderNo.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = statusFilter.value ? o.status === statusFilter.value : true
    return matchesSearch && matchesStatus
  })
)

function statusLabel(status) {
  const map = {
    new: 'Telah dibuat',
    pending_validation: 'Sedang ditinjau',
    rejected: 'Dikembalikan',
    in_testing: 'Proses Pengujian',
    completed: 'Sertifikat Siap',
  }
  return map[status] || status
}

function addReview() {
  Object.assign(form, {
    orderNo: '',
    sampleNo: '',
    date: new Date().toISOString().substr(0, 10),
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    testType: null,
    note: '',
  })
  reviewRows.forEach((r) => (r.result = ''))
  signatures.customer = null
  signatures.admin = null
  editingOrderId.value = null
  showForm.value = true
}

function editReview(item) {
  Object.assign(form, item)
  editingOrderId.value = item.id
  showForm.value = true
}

function deleteReview(item) {
  if (confirm('Hapus data kaji ulang ini?')) {
    const idx = orderStore.orders.findIndex((o) => o.id === item.id)
    if (idx !== -1) orderStore.orders.splice(idx, 1)
  }
}

function getRowOptions(topic) {
  const yesNo = ['Peralatan', 'Personel', 'Waktu', 'Laboratorium Subkontrak']
  if (yesNo.includes(topic)) return ['Ada', 'Tidak']
  if (topic === 'Kondisi') return ['Siap Uji', 'Prepare Sampel']
  return ['Ada', 'Tidak']
}

function saveDraft() {
  alert('Draft disimpan (dummy)')
}

function approveReview() {
  showPaymentModal.value = true
}

function rejectReview() {
  alert('Order ditolak')
}

function onPaymentSaved(detail) {
  const { orderId, total, downPayment, remaining } = detail
  orderStore.updateOrder(orderId, { total, downPayment, remaining })
  orderStore.setStatus(orderId, 'pending_validation')
  showPaymentModal.value = false
  showForm.value = false
  alert('Pembayaran berhasil disimpan (dummy)')
}

const selectedCustomerAddress = computed(() => form.customerAddress || '')
</script>
