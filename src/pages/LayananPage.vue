<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Layanan &amp; Tarif</h2>

    <!-- Jenis Pengujian -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Jenis Pengujian</h3>

      <table class="min-w-full text-sm border border-gray-200 mb-2">
        <thead class="bg-muted">
          <tr>
            <th class="border-b px-2 py-2 w-12">No</th>
            <th class="border-b px-2 py-2">Nama</th>
            <th class="border-b px-2 py-2 w-40">Tarif</th>
            <th class="border-b px-2 py-2">Metode Uji</th>
            <th class="border-b px-2 py-2">Mesin Uji</th>
            <th class="border-b px-2 py-2 w-28">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(t, index) in tests"
            :key="t.id"
            class="odd:bg-white even:bg-gray-50"
          >
            <td class="border-b px-2 py-2 text-center">{{ index + 1 }}</td>
            <td class="border-b px-2 py-2">{{ t.name }}</td>
            <td class="border-b px-2 py-2">
              Rp {{ t.price.toLocaleString('id-ID') }}
            </td>
            <td class="border-b px-2 py-2">{{ t.method }}</td>
            <td class="border-b px-2 py-2">{{ t.equipment }}</td>
            <td class="border-b px-2 py-2 text-center">
              <button
                class="text-danger text-sm hover:underline"
                @click="removeTest(t.id)"
              >
                Hapus
              </button>
            </td>
          </tr>
          <tr v-if="!tests.length">
            <td colspan="6" class="text-center text-gray-500 py-4">
              Belum ada data jenis pengujian.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Form tambah jenis pengujian -->
      <div class="flex flex-wrap gap-2 items-center">
        <input
          v-model="newTest.name"
          placeholder="Nama pengujian"
          class="border border-gray-300 rounded-md px-2 py-1"
        />
        <input
          v-model.number="newTest.price"
          type="number"
          placeholder="Tarif"
          class="border border-gray-300 rounded-md px-2 py-1 w-36"
        />

        <select
          v-model="newTest.method"
          class="border border-gray-300 rounded-md px-2 py-1"
        >
          <option value="" disabled>Metode Uji</option>
          <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
        </select>

        <select
          v-model="newTest.equipment"
          class="border border-gray-300 rounded-md px-2 py-1"
        >
          <option value="" disabled>Mesin Uji</option>
          <option v-for="m in machines" :key="m" :value="m">{{ m }}</option>
        </select>

        <button
          class="bg-gradient-to-r from-primaryLight to-primaryDark text-white px-3 py-1 rounded text-sm"
          @click="addTest"
        >
          Tambah
        </button>
      </div>
    </div>

    <!-- Mesin Uji -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Mesin Uji</h3>
      <table class="min-w-full text-sm border border-gray-200 mb-2">
        <thead class="bg-muted">
          <tr>
            <th class="border-b px-2 py-2 w-12">No</th>
            <th class="border-b px-2 py-2">Nama Mesin</th>
            <th class="border-b px-2 py-2 w-28">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in machines"
            :key="item + index"
            class="odd:bg-white even:bg-gray-50"
          >
            <td class="border-b px-2 py-2 text-center">{{ index + 1 }}</td>
            <td class="border-b px-2 py-2">{{ item }}</td>
            <td class="border-b px-2 py-2 text-center">
              <button
                class="text-danger text-sm hover:underline"
                @click="removeMachine(index)"
              >
                Hapus
              </button>
            </td>
          </tr>
          <tr v-if="!machines.length">
            <td colspan="3" class="text-center text-gray-500 py-4">
              Belum ada data mesin uji.
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex gap-2">
        <input
          v-model="newMachine"
          placeholder="Nama mesin uji"
          class="border border-gray-300 rounded-md px-2 py-1"
        />
        <button
          class="bg-gradient-to-r from-primaryLight to-primaryDark text-white px-3 py-1 rounded text-sm"
          @click="addMachine"
        >
          Tambah
        </button>
      </div>
    </div>

    <!-- Metode Uji -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Metode Uji</h3>
      <table class="min-w-full text-sm border border-gray-200 mb-2">
        <thead class="bg-muted">
          <tr>
            <th class="border-b px-2 py-2 w-12">No</th>
            <th class="border-b px-2 py-2">Nama Metode</th>
            <th class="border-b px-2 py-2 w-28">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in methods"
            :key="item + index"
            class="odd:bg-white even:bg-gray-50"
          >
            <td class="border-b px-2 py-2 text-center">{{ index + 1 }}</td>
            <td class="border-b px-2 py-2">{{ item }}</td>
            <td class="border-b px-2 py-2 text-center">
              <button
                class="text-danger text-sm hover:underline"
                @click="removeMethod(index)"
              >
                Hapus
              </button>
            </td>
          </tr>
          <tr v-if="!methods.length">
            <td colspan="3" class="text-center text-gray-500 py-4">
              Belum ada data metode uji.
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex gap-2">
        <input
          v-model="newMethod"
          placeholder="Nama metode uji"
          class="border border-gray-300 rounded-md px-2 py-1"
        />
        <button
          class="bg-gradient-to-r from-primaryLight to-primaryDark text-white px-3 py-1 rounded text-sm"
          @click="addMethod"
        >
          Tambah
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import { useTestStore } from '@/stores/useTestStore';

const testStore = useTestStore();

// Ambil dari store
const tests = computed(() => testStore.tests);
const machines = computed(() => testStore.machines);
const methods = computed(() => testStore.methods);

// Form tambah jenis pengujian
const newTest = reactive({
  name: '',
  price: 0,
  method: '',
  equipment: '',
});

// Actions – panggil store, jangan mutasi lokal
function addTest() {
  testStore.addTest({ ...newTest });
  newTest.name = '';
  newTest.price = 0;
  newTest.method = '';
  newTest.equipment = '';
}
function removeTest(id) {
  testStore.removeTest(id);
}

// Mesin Uji
const newMachine = ref('');
function addMachine() {
  testStore.addMachine(newMachine.value);
  newMachine.value = '';
}
function removeMachine(idx) {
  testStore.removeMachine(idx);
}

// Metode Uji
const newMethod = ref('');
function addMethod() {
  testStore.addMethod(newMethod.value);
  newMethod.value = '';
}
function removeMethod(idx) {
  testStore.removeMethod(idx);
}
</script>
