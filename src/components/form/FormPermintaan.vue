<template>
  <div class="p-4">
    <h3 class="text-lg font-semibold mb-4">
      {{ isEdit ? 'Edit Permintaan' : 'Tambah Permintaan' }}
    </h3>

    <form
      @submit.prevent="handleSubmit"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <!-- Tanggal Masuk -->
      <div>
        <label class="block text-sm font-medium mb-1">Tanggal Masuk</label>
        <input
          v-model="form.entryDate"
          type="date"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
      </div>

      <!-- Nama Customer -->
      <div>
        <label class="block text-sm font-medium mb-1">Nama Customer</label>
        <input
          v-model="form.customerName"
          type="text"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="Nama Customer"
        />
      </div>

      <!-- No Telepon -->
      <div>
        <label class="block text-sm font-medium mb-1">No Telepon</label>
        <input
          v-model="form.phoneNumber"
          type="text"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="No Telepon"
        />
      </div>

      <!-- Alamat -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Alamat</label>
        <textarea
          v-model="form.address"
          rows="2"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="Alamat lengkap"
        ></textarea>
      </div>

      <!-- Keperluan -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Keperluan</label>
        <textarea
          v-model="form.purpose"
          rows="2"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="Tuliskan keperluan pengujian atau machining"
        ></textarea>
      </div>

      <!-- Jenis Pekerjaan -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Jenis Pekerjaan</label>
        <select
          v-model="form.jobCategory"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
        >
          <option disabled value="">Pilih kategori</option>
          <option>Pendidikan</option>
          <option>IKM</option>
          <option>Kontraktor</option>
          <option>Internal</option>
          <option>Lainnya</option>
        </select>
      </div>

      <!-- Tombol -->
      <div class="md:col-span-2 flex justify-end gap-3 mt-4">
        <button
          type="button"
          class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          @click="$emit('cancel')"
        >
          Batal
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark"
        >
          {{ isEdit ? 'Simpan Perubahan' : 'Tambah Permintaan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Object,
  isEdit: Boolean,
})

const emit = defineEmits(['submit', 'cancel'])

// 🧩 Form data (English keys)
const form = ref({
  idOrder: '',
  entryDate: '',
  customerName: '',
  phoneNumber: '',
  address: '',
  purpose: '',
  jobCategory: '',
  status: 'draft',
})

// 🔁 Autofill data saat edit
watch(
  () => props.modelValue,
  (val) => {
    if (val) form.value = { ...val }
  },
  { immediate: true }
)

// 🪄 Generate unique ID automatically
function generateOrderId() {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `ORD-${dateStr}-${randomNum}`
}

// 💾 Submit handler
const handleSubmit = () => {
  if (!props.isEdit && !form.value.idOrder) {
    form.value.idOrder = generateOrderId()
  }
  emit('submit', { ...form.value })
}
</script>
