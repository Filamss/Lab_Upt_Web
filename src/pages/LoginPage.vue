<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primaryLight/10 via-white to-primaryDark/10 px-4 py-10"
  >
    <div
      class="relative w-full max-w-5xl bg-white shadow-2xl rounded-[48px] overflow-hidden md:min-h-[640px]"
    >
      <!-- Desktop / tablet layout -->
      <div class="hidden h-full md:block">
        <div
          class="absolute inset-0 flex w-[200%] transition-transform duration-700 ease-in-out"
          :class="isRegister ? '-translate-x-1/2' : 'translate-x-0'"
        >
          <!-- Sign In -->
          <section
            class="basis-1/2 flex-shrink-0 px-10 pt-12 pb-16 flex flex-col justify-start transition-all duration-500 ease-out relative z-20"
            :class="
              isRegister
                ? 'opacity-0 scale-95 pointer-events-none'
                : 'opacity-100 scale-100 pointer-events-auto'
            "
          >
            <div class="w-full max-w-sm mr-auto">
              <header class="text-left">
                <p
                  class="text-xs font-semibold tracking-wide text-primaryLight uppercase"
                >
                  Selamat Datang
                </p>
                <h2 class="text-3xl font-semibold text-primaryDark mt-1">
                  Masuk
                </h2>
                <p class="mt-3 text-sm text-gray-500 leading-relaxed">
                  Masuk menggunakan email dan password Anda untuk melanjutkan
                  pengelolaan dashboard.
                </p>
              </header>

              <form
                novalidate
                @submit.prevent="handleLogin"
                class="mt-6 space-y-6"
              >
                <FormField
                  label="Email"
                  type="email"
                  placeholder="nama@gmail.com"
                  v-model="loginEmail"
                  :error="formErrors.login.email"
                />
                <FormPasswordField
                  label="Password"
                  placeholder="Masukkan password"
                  v-model="loginPassword"
                  :revealed="showLoginPassword"
                  :error="formErrors.login.password"
                  @toggle="showLoginPassword = !showLoginPassword"
                />

                <button
                  type="submit"
                  :disabled="isLoading"
                  class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span v-if="!isLoading">Masuk</span>
                  <span v-else>Memproses...</span>
                </button>
              </form>

              <AlertBanner v-if="loginError" tone="error" class="mt-6">
                {{ loginError }}
              </AlertBanner>
            </div>
          </section>

          <!-- Sign Up -->
          <section
            class="basis-1/2 flex-shrink-0 px-10 pt-12 pb-16 flex flex-col justify-start transition-all duration-500 ease-out overflow-y-auto relative z-20"
            :class="
              isRegister
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
            "
          >
            <div class="w-full max-w-sm ml-auto pr-1 mt-6">
              <header class="text-left">
                <p
                  class="text-xs font-semibold tracking-wide text-primaryLight uppercase"
                >
                  Akun Baru
                </p>
                <h2 class="text-3xl font-semibold text-primaryDark mt-1">
                  Daftar
                </h2>
                <p class="mt-3 text-sm text-gray-500 leading-relaxed">
                  Isi informasi berikut untuk membuat akun dan nikmati seluruh
                  fitur dashboard.
                </p>
              </header>

              <form
                novalidate
                @submit.prevent="handleRegister"
                class="mt-6 space-y-3"
              >
                <FormField
                  label="Nama"
                  placeholder="Nama lengkap"
                  v-model="registerName"
                  :error="formErrors.register.name"
                />
                <FormField
                  label="Email"
                  type="email"
                  placeholder="nama@gmail.com"
                  v-model="registerEmail"
                  :error="formErrors.register.email"
                />
                <FormField
                  label="No Telepon"
                  type="tel"
                  inputmode="tel"
                  placeholder="08xxxxxxxxxx"
                  v-model="registerPhone"
                  :error="formErrors.register.phone"
                />
                <FormPasswordField
                  label="Password"
                  placeholder="Buat password"
                  v-model="registerPassword"
                  :revealed="showRegisterPassword"
                  :error="formErrors.register.password"
                  @toggle="showRegisterPassword = !showRegisterPassword"
                />
                <FormPasswordField
                  label="Konfirmasi Password"
                  placeholder="Ulangi password"
                  v-model="registerConfirmPassword"
                  :revealed="showRegisterConfirmPassword"
                  :error="formErrors.register.confirmPassword"
                  @toggle="
                    showRegisterConfirmPassword = !showRegisterConfirmPassword
                  "
                />

                <button
                  type="submit"
                  :disabled="isLoading"
                  class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span v-if="!isLoading">Daftar</span>
                  <span v-else>Memproses...</span>
                </button>
              </form>

              <AlertBanner v-if="registerError" tone="error" class="mt-6">
                {{ registerError }}
              </AlertBanner>
              <AlertBanner
                v-else-if="registerSuccess"
                tone="success"
                class="mt-6"
              >
                {{ registerSuccess }}
              </AlertBanner>
            </div>
          </section>
        </div>

        <div
          class="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-br from-primaryLight to-primaryDark text-white transition-transform duration-700 ease-in-out flex flex-col items-center justify-center text-center px-10 overflow-hidden z-10"
          :class="
            isRegister
              ? 'translate-x-0 rounded-l-[48px] rounded-r-[48px]'
              : 'translate-x-full rounded-l-[48px] rounded-r-[48px]'
          "
        >
          <div
            class="pointer-events-none absolute top-1/2 -translate-y-1/2 w-[260px] h-[260px] bg-white/20 rounded-full blur-3xl opacity-70 transition-all duration-700"
            :class="isRegister ? 'right-[-80px]' : 'left-[-80px]'"
          ></div>

          <transition name="fade" mode="out-in">
            <div v-if="!isRegister" key="cta-register" class="space-y-6">
              <h3 class="text-2xl font-semibold">Welcome!</h3>
              <p class="text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
                Belum punya akun? Daftar sekarang untuk mulai menggunakan semua
                fitur dashboard kami.
              </p>
              <button
                type="button"
                class="mt-4 border border-white/60 text-white font-medium px-10 py-3 rounded-full hover:bg-white hover:text-primaryDark transition pointer-events-auto"
                @click="switchToRegister"
              >
                Daftar
              </button>
            </div>
            <div v-else key="cta-login" class="space-y-6">
              <h3 class="text-2xl font-semibold">Welcome Back!</h3>
              <p class="text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
                Sudah punya akun? Masuk untuk melanjutkan pengelolaan dashboard
                Anda.
              </p>
              <button
                type="button"
                class="mt-4 border border-white/60 text-white font-medium px-10 py-3 rounded-full hover:bg-white hover:text-primaryDark transition pointer-events-auto"
                @click="switchToLogin"
              >
                Masuk
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- Mobile layout -->
      <div class="md:hidden relative z-10 px-6 py-10 space-y-8">
        <div
          class="flex justify-center gap-3 bg-primaryLight/10 rounded-full p-1"
        >
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium rounded-full transition"
            :class="
              !isRegister
                ? 'bg-gradient-to-r from-primaryLight to-primaryDark text-white shadow-md'
                : 'text-primaryDark'
            "
            @click="switchToLogin"
          >
            Masuk
          </button>
          <button
            type="button"
            class="flex-1 py-2 text-sm font-medium rounded-full transition"
            :class="
              isRegister
                ? 'bg-gradient-to-r from-primaryLight to-primaryDark text-white shadow-md'
                : 'text-primaryDark'
            "
            @click="switchToRegister"
          >
            Daftar
          </button>
        </div>

        <transition name="mobile-switch" mode="out-in">
          <div v-if="!isRegister" key="mobile-login" class="space-y-6">
            <header class="text-center space-y-2">
              <h2 class="text-2xl font-semibold text-primaryDark">Masuk</h2>
              <p class="text-sm text-gray-500">
                Masuk menggunakan email dan password Anda.
              </p>
            </header>

            <form novalidate @submit.prevent="handleLogin" class="space-y-3">
              <FormField
                label="Email"
                type="email"
                placeholder="nama@gmail.com"
                v-model="loginEmail"
                :error="formErrors.login.email"
              />
              <FormPasswordField
                label="Password"
                placeholder="Masukkan password"
                v-model="loginPassword"
                :revealed="showLoginPassword"
                :error="formErrors.login.password"
                @toggle="showLoginPassword = !showLoginPassword"
              />
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="!isLoading">Masuk</span>
                <span v-else>Memproses...</span>
              </button>
            </form>

            <AlertBanner v-if="loginError" tone="error">
              {{ loginError }}
            </AlertBanner>
          </div>

          <div v-else key="mobile-register" class="space-y-6">
            <header class="text-center space-y-2">
              <h2 class="text-2xl font-semibold text-primaryDark">Daftar</h2>
              <p class="text-sm text-gray-500">
                Buat akun baru untuk mengakses dashboard.
              </p>
            </header>

            <form novalidate @submit.prevent="handleRegister" class="space-y-3">
              <FormField
                label="Nama"
                placeholder="Nama lengkap"
                v-model="registerName"
                :error="formErrors.register.name"
              />
              <FormField
                label="Email"
                type="email"
                placeholder="nama@gmail.com"
                v-model="registerEmail"
                :error="formErrors.register.email"
              />
              <FormField
                label="No Telepon"
                type="tel"
                inputmode="tel"
                placeholder="08xxxxxxxxxx"
                v-model="registerPhone"
                :error="formErrors.register.phone"
              />
              <FormPasswordField
                label="Password"
                placeholder="Buat password"
                v-model="registerPassword"
                :revealed="showRegisterPassword"
                :error="formErrors.register.password"
                @toggle="showRegisterPassword = !showRegisterPassword"
              />
              <FormPasswordField
                label="Konfirmasi Password"
                placeholder="Ulangi password"
                v-model="registerConfirmPassword"
                :revealed="showRegisterConfirmPassword"
                :error="formErrors.register.confirmPassword"
                @toggle="
                  showRegisterConfirmPassword = !showRegisterConfirmPassword
                "
              />
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="!isLoading">Daftar</span>
                <span v-else>Memproses...</span>
              </button>
            </form>

            <AlertBanner v-if="registerError" tone="error">
              {{ registerError }}
            </AlertBanner>
            <AlertBanner v-else-if="registerSuccess" tone="success">
              {{ registerSuccess }}
            </AlertBanner>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isRegister = ref(route.path === '/register');

const loginEmail = ref('');
const loginPassword = ref('');
const showLoginPassword = ref(false);
const loginError = ref('');
const formErrors = reactive({
  login: {
    email: '',
    password: '',
  },
  register: {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  },
});

const registerName = ref('');
const registerEmail = ref('');
const registerPhone = ref('');
const registerPassword = ref('');
const registerConfirmPassword = ref('');
const showRegisterPassword = ref(false);
const showRegisterConfirmPassword = ref(false);
const registerError = ref('');
const registerSuccess = ref('');

const isLoading = computed(() => authStore.loading);

watch(
  () => route.path,
  (path) => {
    isRegister.value = path === '/register';
  }
);

watch(isRegister, (value, oldValue) => {
  if (value === oldValue) return;
  loginError.value = '';
  registerError.value = '';
  registerSuccess.value = '';

  if (value && route.path !== '/register') {
    router.replace('/register');
  } else if (!value && route.path !== '/login') {
    router.replace('/login');
  }
});

async function handleLogin() {
  loginError.value = '';
  formErrors.login.email = loginEmail.value.trim() ? '' : 'Email wajib diisi.';
  formErrors.login.password = loginPassword.value.trim()
    ? ''
    : 'Password wajib diisi.';

  if (formErrors.login.email || formErrors.login.password) {
    loginError.value = 'Harap lengkapi data login Anda.';
    return;
  }

  const res = await authStore.login({
    email: loginEmail.value,
    password: loginPassword.value,
  });
  if (res.ok) {
    resetErrors();
    router.push('/Dashboard');
  } else {
    loginError.value = res.message || 'Email atau password salah.';
  }
}

async function handleRegister() {
  registerError.value = '';
  registerSuccess.value = '';
  formErrors.register.name = registerName.value.trim()
    ? ''
    : 'Nama wajib diisi.';
  formErrors.register.email = registerEmail.value.trim()
    ? ''
    : 'Email wajib diisi.';
  formErrors.register.password = registerPassword.value.trim()
    ? ''
    : 'Password wajib diisi.';
  formErrors.register.confirmPassword = registerConfirmPassword.value.trim()
    ? ''
    : 'Konfirmasi password wajib diisi.';

  if (
    registerPhone.value &&
    !/^(0|\+?\d)\d{8,15}$/.test(registerPhone.value.trim())
  ) {
    formErrors.register.phone = 'Nomor telepon tidak valid.';
  } else {
    formErrors.register.phone = '';
  }

  if (registerPassword.value !== registerConfirmPassword.value) {
    registerError.value = 'Password dan konfirmasi password tidak sama.';
    formErrors.register.password = 'Pastikan password sama.';
    formErrors.register.confirmPassword = 'Pastikan password sama.';
    return;
  }

  if (
    formErrors.register.name ||
    formErrors.register.email ||
    formErrors.register.password ||
    formErrors.register.confirmPassword ||
    formErrors.register.phone
  ) {
    registerError.value = 'Harap lengkapi data yang diperlukan.';
    return;
  }

  const res = await authStore.register({
    name: registerName.value,
    email: registerEmail.value,
    password: registerPassword.value,
    phone_number: registerPhone.value || undefined,
  });

  if (res.ok) {
    registerSuccess.value = 'Registrasi berhasil. Silakan masuk.';
    loginEmail.value = registerEmail.value;
    loginPassword.value = registerPassword.value;
    resetErrors();
    setTimeout(() => switchToLogin(), 800);
  } else {
    registerError.value = res.message || 'Registrasi gagal. Coba lagi.';
  }
}

function switchToRegister() {
  isRegister.value = true;
  resetErrors();
}

function switchToLogin() {
  isRegister.value = false;
  resetErrors();
}

function resetErrors() {
  formErrors.login.email = '';
  formErrors.login.password = '';
  formErrors.register.name = '';
  formErrors.register.email = '';
  formErrors.register.phone = '';
  formErrors.register.password = '';
  formErrors.register.confirmPassword = '';
}

const renderEye = (pupilPath) =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': 1.5,
      stroke: 'currentColor',
      class: 'w-5 h-5',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M3.98 8.223A10.477 10.477 0 0112 4.5c4.478 0 8.268 2.943 9.802 7.023a10.52 10.52 0 01-1.28 2.243m-2.21 2.46A10.451 10.451 0 0112 19.5a10.451 10.451 0 01-6.803-2.774m-2.22-2.46A10.522 10.522 0 013.98 8.223',
      }),
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: pupilPath,
      }),
    ]
  );

const EyeIcon = defineComponent({
  props: {
    revealed: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return () =>
      props.revealed
        ? renderEye('M15 12a3 3 0 11-6 0 3 3 0 016 0z')
        : renderEye('M15 12a3 3 0 11-6 0 3 3 0 016 0z');
  },
});

const AlertBanner = defineComponent({
  props: {
    tone: {
      type: String,
      default: 'info',
    },
  },
  setup(props, { slots }) {
    const toneClass =
      props.tone === 'error'
        ? 'bg-red-50 border border-red-200 text-red-600'
        : props.tone === 'success'
        ? 'bg-green-50 border border-green-200 text-green-600'
        : 'bg-primaryLight/10 border border-primaryLight/30 text-primaryDark';
    return () =>
      h(
        'div',
        { class: `rounded-xl px-4 py-3 text-sm font-medium ${toneClass}` },
        slots.default ? slots.default() : []
      );
  },
});

const FormField = defineComponent({
  props: {
    modelValue: String,
    label: String,
    placeholder: String,
    type: {
      type: String,
      default: 'text',
    },
    inputmode: {
      type: String,
      default: undefined,
    },
    error: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onInput = (event) => emit('update:modelValue', event.target.value);
    return () =>
      h('div', { class: 'space-y-2' }, [
        h(
          'label',
          { class: 'block text-sm font-medium text-gray-700' },
          props.label
        ),
        h('input', {
          class:
            'w-full rounded-xl px-4 py-3 shadow-sm focus:outline-none transition-all ' +
            (props.error
              ? 'border border-red-400 focus:ring-2 focus:ring-red-300'
              : 'border border-gray-200 focus:ring-2 focus:ring-primaryLight'),
          type: props.type,
          placeholder: props.placeholder,
          value: props.modelValue,
          inputmode: props.inputmode,
          onInput,
        }),
        props.error
          ? h('p', { class: 'text-xs text-red-500 font-medium' }, props.error)
          : null,
      ]);
  },
});

const FormPasswordField = defineComponent({
  props: {
    modelValue: String,
    label: String,
    placeholder: String,
    error: {
      type: String,
      default: '',
    },
    revealed: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'toggle'],
  setup(props, { emit }) {
    const onInput = (event) => emit('update:modelValue', event.target.value);
    return () =>
      h('div', { class: 'space-y-2' }, [
        h(
          'label',
          { class: 'block text-sm font-medium text-gray-700' },
          props.label
        ),
        h('div', { class: 'relative' }, [
          h('input', {
            class:
              'w-full rounded-xl px-4 py-3 shadow-sm focus:outline-none transition-all pr-12 ' +
              (props.error
                ? 'border border-red-400 focus:ring-2 focus:ring-red-300'
                : 'border border-gray-200 focus:ring-2 focus:ring-primaryLight'),
            type: props.revealed ? 'text' : 'password',
            placeholder: props.placeholder,
            value: props.modelValue,
            required: true,
            onInput,
          }),
          h(
            'button',
            {
              type: 'button',
              class:
                'absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 transition',
              onClick: () => emit('toggle'),
              'aria-label': 'Tampilkan password',
            },
            [h(EyeIcon, { revealed: props.revealed })]
          ),
        ]),
        props.error
          ? h('p', { class: 'text-xs text-red-500 font-medium' }, props.error)
          : null,
      ]);
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.mobile-switch-enter-active,
.mobile-switch-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.mobile-switch-enter-from,
.mobile-switch-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
