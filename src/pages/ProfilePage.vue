<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4 text-primary">My Profile</h1>

    <!-- === Tampilan Data Profil === -->
    <div v-if="user" class="bg-white rounded-xl shadow p-6 space-y-3">
      <div class="flex items-center gap-4 mb-4">
        <img
          :src="userAvatar"
          alt="Avatar"
          class="w-20 h-20 rounded-full ring-2 ring-primary/40 object-cover"
        />
        <div>
          <h2 class="text-xl font-semibold">{{ user.name }}</h2>
          <p class="text-gray-500">{{ user.email }}</p>
          <span
            class="inline-block mt-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded"
          >
            {{ user.role }}
          </span>
        </div>
      </div>

      <div class="pt-4 flex gap-3">
        <button
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark"
          @click="editMode = !editMode"
        >
          {{ editMode ? 'Cancel' : 'Edit Profile' }}
        </button>
        <button
          class="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- === Form Edit Profil === -->
    <div
      v-if="editMode"
      class="bg-white rounded-xl shadow p-6 space-y-4 mt-6 border border-border"
    >
      <h2 class="text-lg font-semibold text-gray-700">Edit Profile</h2>

      <!-- Upload Foto -->
      <div>
        <label class="block text-gray-600 text-sm mb-1">Foto Profil</label>
        <div class="flex items-center gap-4">
          <img
            :src="previewAvatar || userAvatar"
            alt="Preview"
            class="w-20 h-20 rounded-full ring-2 ring-primary/40 object-cover"
          />
          <input
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            class="text-sm"
          />
        </div>
      </div>

      <div>
        <label class="block text-gray-600 text-sm mb-1">Nama Lengkap</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full border border-border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label class="block text-gray-600 text-sm mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="w-full border border-border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label class="block text-gray-600 text-sm mb-1">Password Baru</label>
        <input
          v-model="form.password"
          type="password"
          class="w-full border border-border rounded-lg px-3 py-2"
          placeholder="(optional)"
        />
      </div>

      <div class="pt-4 flex gap-3">
        <button
          class="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-700"
          @click="saveProfile"
        >
          Save
        </button>
        <button
          class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          @click="editMode = false"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- === Jika user belum login === -->
    <div v-if="!user" class="text-gray-500 text-center mt-10">
      Loading profile...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'

const authStore = useAuthStore()
const userStore = useUserStore()
const { currentUser: user } = storeToRefs(authStore)

onMounted(() => {
  if (!authStore.currentUser) {
    authStore.init()
  }
})

/* -------------------------
   Avatar dan Preview
--------------------------*/
const previewAvatar = ref(null)
const avatarFile = ref(null)

const userAvatar = computed(() => {
  return user.value?.avatar || 'https://placehold.co/100x100'
})

/* -------------------------
   Form & State
--------------------------*/
const editMode = ref(false)
const form = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
  password: '',
})

/* -------------------------
   Upload Handler
--------------------------*/
const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  avatarFile.value = file

  const reader = new FileReader()
  reader.onload = () => {
    previewAvatar.value = reader.result
  }
  reader.readAsDataURL(file)
}

/* -------------------------
   Logout
--------------------------*/
const logout = () => {
  authStore.logout()
  window.location.href = '/login'
}

/* -------------------------
   Simpan Profil (Local + API Ready)
--------------------------*/
const saveProfile = async () => {
  if (!user.value) return

  try {
    // Siapkan data untuk dikirim ke backend nanti
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('email', form.value.email)
    if (form.value.password) formData.append('password', form.value.password)
    if (avatarFile.value) formData.append('avatar', avatarFile.value)

    /* 🔹 API call — aktifkan ini saat backend Go siap
    const res = await axios.put('/api/profile', formData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    const updatedUser = res.data.user
    */

    // 🔸 Untuk sekarang (tanpa backend)
    const updatedUser = {
      ...user.value,
      name: form.value.name,
      email: form.value.email,
      avatar: previewAvatar.value || user.value.avatar,
    }

    // Update password di local userStore (dummy)
    if (form.value.password) {
      const localUser = userStore.users.find(u => u.id === user.value.id)
      if (localUser) localUser.password = form.value.password
    }

    // Update Pinia & localStorage
    authStore.currentUser = updatedUser
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))

    editMode.value = false
    previewAvatar.value = null
    avatarFile.value = null
    alert('Profile updated successfully!')
  } catch (err) {
    console.error('Error saving profile:', err)
    alert('Failed to update profile.')
  }
}
</script>

<style scoped>
input:focus {
  outline: none;
  border-color: #0d5bd5;
  box-shadow: 0 0 0 1px #0d5bd5;
}
</style>
