<template>
  <div class="backdrop" @click="emit('close')">
    <div class="modal card" @click.stop>
      <div class="head">
        <div>
          <h3 class="title">Reset Password</h3>
          <div class="sub">
            Reset password for <span class="mono">{{ email }}</span>
          </div>
        </div>

        <button class="x" type="button" @click="emit('close')" aria-label="Close">×</button>
      </div>

      <div class="body">
        <div class="grid">
          <div class="field">
            <label>New Password</label>
            <input v-model="password" class="input" :type="show ? 'text' : 'password'" placeholder="Enter new password"
              autocomplete="new-password" />
          </div>

          <div class="field">
            <label>Confirm Password</label>
            <input v-model="confirm" class="input" :type="show ? 'text' : 'password'" placeholder="Confirm new password"
              autocomplete="new-password" />
          </div>
        </div>

        <label class="chk">
          <input type="checkbox" v-model="show" />
          <span>Show password</span>
        </label>

        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="ok" class="ok">{{ ok }}</div>
      </div>

      <div class="foot">
        <button class="btn2" type="button" @click="emit('close')" :disabled="saving">Cancel</button>
        <button class="btn danger" type="button" @click="save" :disabled="saving">
          {{ saving ? 'Saving...' : 'Reset Password' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userManagementService } from './user-management.service'

const props = defineProps<{
  userId: string
  email: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const password = ref('')
const confirm = ref('')
const show = ref(false)

const saving = ref(false)
const error = ref<string | null>(null)
const ok = ref<string | null>(null)

const validate = () => {
  error.value = null
  ok.value = null

  const p = password.value.trim()
  const c = confirm.value.trim()

  if (!p || p.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return false
  }
  if (p !== c) {
    error.value = 'Password and confirm password do not match.'
    return false
  }
  return true
}

const getErrorMessage = (e: unknown): string => {
  if (typeof e === 'object' && e !== null) {
    const obj = e as Record<string, unknown>

    const response = obj['response']
    if (typeof response === 'object' && response !== null) {
      const resObj = response as Record<string, unknown>
      const data = resObj['data']
      if (typeof data === 'object' && data !== null) {
        const dataObj = data as Record<string, unknown>
        const msg = dataObj['message']
        if (typeof msg === 'string' && msg.trim()) return msg
      }
    }

    const msg = obj['message']
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return 'Failed to reset password.'
}

const save = async () => {
  if (!validate()) return

  saving.value = true
  error.value = null
  ok.value = null

  try {
    await userManagementService.resetPassword(props.userId, { newPassword: password.value })
    ok.value = 'Password reset successfully.'
    password.value = ''
    confirm.value = ''
    emit('saved')
  } catch (e: unknown) {
    error.value = getErrorMessage(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .35);
  display: grid;
  place-items: center;
  z-index: 9999;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .18);
}

.modal {
  width: min(720px, calc(100vw - 24px));
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 950;
}

.sub {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 800;
  color: #6b7280;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.x {
  height: 34px;
  width: 34px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-weight: 950;
  cursor: pointer;
}

.body {
  padding: 12px 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 680px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 6px;
}

.input {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 12px;
  font-weight: 800;
}

.chk {
  margin-top: 10px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-weight: 900;
  color: #374151;
  user-select: none;
}

.error {
  margin-top: 10px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 900;
}

.ok {
  margin-top: 10px;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 900;
}

.foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.btn {
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: none;
  background: #172d30;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn.danger {
  background: #b91c1c;
}

.btn2 {
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn:disabled,
.btn2:disabled {
  opacity: .6;
  cursor: not-allowed;
}
</style>
