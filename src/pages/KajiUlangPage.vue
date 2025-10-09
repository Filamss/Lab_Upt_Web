<template>
  <div>
    <!-- Listing table when form is hidden -->
    <div v-if="!showForm">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Kaji Ulang Permintaan</h2>
        <button
          class="bg-gradient-to-r from-primaryLight to-primaryDark text-white px-4 py-2 rounded-lg"
          @click="addKajiUlang"
        >
          Tambah Kaji Ulang
        </button>
      </div>
      <!-- Search and filter bar -->
      <div class="bg-white rounded-xl shadow-md p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div class="flex-1">
          <input
            type="text"
            v-model="search"
            placeholder="Cari berdasarkan order no"
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
      <!-- Table listing -->
      <div class="bg-white rounded-xl shadow-md p-4">
        <table class="min-w-full text-sm border border-gray-200">
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
              v-for="item in filteredKajiUlangList"
              :key="item.id"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="border-b px-3 py-2">{{ item.orderNo }}</td>
              <td class="border-b px-3 py-2">{{ item.sampleNo }}</td>
              <td class="border-b px-3 py-2">{{ item.date }}</td>
              <td class="border-b px-3 py-2">{{ statusLabel(item.status) }}</td>
              <td class="border-b px-3 py-2 text-center">
                <button
                  class="text-primary mr-2"
                  @click="editKajiUlang(item)"
                  title="Edit"
                >
                  <PencilIcon class="w-5 h-5 inline" />
                </button>
                <button
                  class="text-danger"
                  @click="deleteKajiUlang(item)"
                  title="Hapus"
                >
                  <TrashIcon class="w-5 h-5 inline" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredKajiUlangList.length === 0">
              <td colspan="5" class="px-3 py-4 text-center text-gray-500">
                Tidak ada data Kaji Ulang
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Kaji Ulang form when showForm is true.  The entire form is
         encapsulated in a separate component to simplify this page. -->
    <FormKajiUlang
      v-if="showForm"
      :form="form"
      :kajiUlangRows="kajiUlangRows"
      :signatures="signatures"
      :tests="tests"
      :selectedCustomerAddress="selectedCustomerAddress"
      :getRowOptions="getRowOptions"
      @save-draft="saveDraft"
      @lolos-kaji-ulang="lolosKajiUlang"
      @tolak="tolak"
      @close="showForm = false"
    />

    <!-- Payment modal pops up when the user clicks "Lolos Kaji Ulang".  It is
         responsible for collecting payment information and updating the order. -->
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/useOrderStore';
import { useCustomerStore } from '@/stores/useCustomerStore';
import { useTestStore } from '@/stores/useTestStore';
// Import the separated form component for Kaji Ulang.  This allows
// reusing the form in other contexts and keeps this page focused on
// listing and navigation.
import FormKajiUlang from './form/FormKajiUlang.vue';
import FormPayment from './form/FormPayment.vue';
// Import icons for the actions in the listing table
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const testStore = useTestStore();

// Whether the form is currently shown.  When false, the listing table
// is displayed; when true, the form is displayed for creating or editing
// a kaji ulang entry.
const showForm = ref(false);

// Whether the payment modal is currently shown.  This is opened when
// the user clicks "Lolos Kaji Ulang" on the form and closed when
// payment details have been saved or the user cancels.
const showPaymentModal = ref(false);

// Search and status filter for the listing table
const search = ref('');
const statusFilter = ref('');

// Computed list of orders relevant for Kaji Ulang.  In this example
// we list all orders, but you could filter by specific statuses if needed.
const kajiUlangList = computed(() => orderStore.orders);

// Filtered list based on search term and selected status
const filteredKajiUlangList = computed(() => {
  return kajiUlangList.value.filter((o) => {
    const matchesSearch = o.orderNo.toLowerCase().includes(search.value.toLowerCase());
    const matchesStatus = statusFilter.value ? o.status === statusFilter.value : true;
    return matchesSearch && matchesStatus;
  });
});

// Map internal status codes to human‑readable labels.  Adjust these
// labels to match your business terminology.
function statusLabel(status) {
  const map = {
    new: 'Telah dibuat',
    pending_validation: 'Sedang ditinjau',
    rejected: 'Dikembalikan',
    in_testing: 'Proses Pengujian',
    completed: 'Sertifikat Siap',
  };
  return map[status] || status;
}

// Show the form for creating a new Kaji Ulang.  Resets all form fields and
// evaluation rows to their default state.
function addKajiUlang() {
  // Reset form fields
  form.orderNo = '';
  form.sampleNo = '';
  form.date = new Date().toISOString().substr(0, 10);
  form.customerId = null;
  form.customerName = '';
  form.customerNo = '';
  form.testType = null;
  // Reset evaluation rows
  kajiUlangRows.forEach((row) => {
    row.hasil = '';
  });
  form.note = '';
  signatures.customer = null;
  signatures.admin = null;
  // Hide any order id for editing
  editingOrderId.value = null;
  showForm.value = true;
}

// Edit an existing Kaji Ulang.  Loads the order fields into the form and
// displays the form.  You can extend this to load saved evaluation values
// if those are stored somewhere.
function editKajiUlang(item) {
  form.orderNo = item.orderNo;
  form.sampleNo = item.sampleNo;
  form.date = item.date;
  form.customerId = item.customerId;
  form.testType = item.testType;
  // Derive customer name from id if available
  const cust = customers.value.find((c) => c.id === item.customerId);
  form.customerName = cust ? cust.name : '';
  // Clear WhatsApp number (not stored in order)
  form.customerNo = '';
  // Reset evaluation results; optionally load saved values here
  kajiUlangRows.forEach((row) => {
    row.hasil = '';
  });
  form.note = '';
  signatures.customer = null;
  signatures.admin = null;
  // Set order id for editing context
  editingOrderId.value = item.id;
  showForm.value = true;
}

// Delete a Kaji Ulang entry.  In this simple example we remove the order
// from the order store after confirmation.  You may want to call an API
// instead or mark the record as deleted.
function deleteKajiUlang(item) {
  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    const idx = orderStore.orders.findIndex((o) => o.id === item.id);
    if (idx !== -1) orderStore.orders.splice(idx, 1);
  }
}

const orderId = computed(() => Number(route.query.orderId) || null);
const order = computed(() => orderStore.orders.find((o) => o.id === orderId.value));

// Track the currently edited order id.  When creating a new Kaji Ulang
// entry this remains null.  When editing an existing order via the
// listing table or via a URL query parameter, this holds the order id.
const editingOrderId = ref(orderId.value);

// Form fields.  Use English keys to mirror the Pinia order store.
//
// In the original design a customer select was used to populate the
// `customerId` field, which in turn drove the address.  To support a
// free‑form customer name and WhatsApp number, we include `customerName`
// and `customerNo` here.  We retain `customerId` for backwards
// compatibility, but the address is derived from `customerName`.
const form = reactive({
  orderNo: '',
  sampleNo: '',
  date: new Date().toISOString().substr(0, 10),
  // Id of the selected customer.  This is preserved when loading an
  // existing order, but the input field now allows entering a name
  // directly, so it may remain null for new entries.
  customerId: null,
  // Name of the customer (free text).
  customerName: '',
  // WhatsApp number of the customer (free text).
  customerNo: '',
  testType: null,
  // General note for the Kaji Ulang evaluation.  This replaces the separate
  // `note` ref used previously.  Use form.note in templates.
  note: '',
});

// Kaji ulang rows
const kajiUlangRows = reactive([
  { perihal: 'Peralatan', hasil: '',  },
  { perihal: 'Personel', hasil: '',  },
  { perihal: 'Waktu', hasil: '',  },
  { perihal: 'Kondisi', hasil: '',  },
  { perihal: 'Laboratorium Subkontrak', hasil: '',  },
]);

// A list of generic evaluation result options is no longer used directly.  Instead,
// each evaluation row uses getRowOptions(perihal) to determine its options.


// Determine allowed result options for each evaluation row based on its
// description.  The example form shows that some perihal use "Ada/Tidak"
// while others such as "Kondisi" use "Siap Uji/Prepare Sampel".  Adjust
// this logic to suit your needs.
function getRowOptions(perihal) {
  // Rows that should offer Ada/Tidak
  const adaTidakFields = ['Peralatan', 'Personel', 'Waktu', 'Laboratorium Subkontrak'];
  if (adaTidakFields.includes(perihal)) {
    return ['Ada', 'Tidak'];
  }
  // Kondisi offers "Siap Uji" or "Prepare Sampel"
  if (perihal === 'Kondisi') {
    return ['Siap Uji', 'Prepare Sampel'];
  }
  // Default options for other fields
  return ['Ada', 'Tidak'];
}

// Signatures
const signatures = reactive({ customer: null, admin: null });

// On mount, populate form from selected order if available
onMounted(() => {
  // If a query parameter exists indicating an order, initialise the form
  // for editing and display it.  Otherwise remain on the listing table.
  if (order.value) {
    editingOrderId.value = order.value.id;
    // Populate order fields from the existing order
    form.orderNo = order.value.orderNo;
    form.sampleNo = order.value.sampleNo;
    form.date = order.value.date;
    form.customerId = order.value.customerId;
    form.testType = order.value.testType;
    // When an existing order is loaded, derive the customer name from the id
    const cust = customers.value.find((c) => c.id === order.value.customerId);
    form.customerName = cust ? cust.name : '';
    form.customerNo = '';
    // Reset evaluation rows to default
    kajiUlangRows.forEach((row) => {
      row.hasil = '';
    });
    form.note = '';
    signatures.customer = null;
    signatures.admin = null;
    showForm.value = true;
  }
});

// Derived list of customers and tests
const customers = computed(() => customerStore.customers);
const tests = computed(() => testStore.tests);

// Find a customer by id when loading existing orders.  For free text name entry
// we locate the address by matching the customer name to the stored customers.
// Note: selectedCustomerById is unused now but preserved for potential reuse.
// const selectedCustomerById = computed(() => customers.value.find((c) => c.id === form.customerId));

// The address field in the form is determined either by the selected customer
// id or by matching the entered customer name to the known customers.  If no
// match is found, the address remains blank.
const selectedCustomerAddress = computed(() => {
  // Prefer the customerId if it is set
  if (form.customerId) {
    const cust = customers.value.find((c) => c.id === form.customerId);
    return cust?.address || '';
  }
  // Otherwise attempt to match by name
  const custByName = customers.value.find((c) => c.name === form.customerName);
  return custByName?.address || '';
});

function saveDraft() {
  // In this skeleton we simply log the form; in a real application,
  // you would persist the draft to local storage or an API.
  console.log('Draft saved', { form, kajiUlangRows, signatures });
  alert('Draft disimpan (dummy)');
}

function lolosKajiUlang() {
  if (!editingOrderId.value) {
    alert('Tidak ada order yang dipilih untuk lolos Kaji Ulang');
    return;
  }
  // Instead of immediately updating the order status and navigating away,
  // open the payment modal so that the user can enter payment details.
  showPaymentModal.value = true;
}

function tolak() {
  if (!editingOrderId.value) {
    alert('Tidak ada order yang dipilih untuk ditolak');
    return;
  }
  orderStore.setStatus(editingOrderId.value, 'rejected');
  alert('Order ditolak');
}

// Handle the payment saved event emitted from the PaymentModal.  When
// payment information is saved, update the corresponding order in the
// store with the new totals and payment amounts, set its status to
// pending validation, hide both the payment modal and the form, and
// optionally notify the user.
function onPaymentSaved(detail) {
  const { orderId, total, downPayment, remaining } = detail;
  // Update order with new totals and payment values
  orderStore.updateOrder(orderId, {
    total,
    downPayment,
    remaining,
  });
  // Set the status to pending_validation now that payment is recorded
  orderStore.setStatus(orderId, 'pending_validation');
  // Hide modal and form
  showPaymentModal.value = false;
  showForm.value = false;
  // Optionally, refresh the listing or show a message
  alert('Pembayaran berhasil disimpan (dummy)');
}
</script>