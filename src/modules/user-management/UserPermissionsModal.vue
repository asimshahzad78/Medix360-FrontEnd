<!-- src/modules/user-management/UserPermissionsModal.vue -->
<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <div>
          <h2 class="modal-title">User Permissions</h2>
          <div class="modal-subtitle">{{ email }}</div>
        </div>
        <button class="icon-btn" type="button" @click="emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="toolbar">
          <input v-model="q" class="search" placeholder="Search permission..." />
          <div class="hint">Selected: {{ selectedSet.size }}</div>
        </div>

        <div v-if="loading" class="loading">Loading...</div>

        <div v-else class="groups">
          <div v-for="g in groups" :key="g.group" class="group">
            <div class="group-header">
              <div class="group-title">{{ g.group }}</div>
              <div class="group-actions">
                <button type="button" class="mini-btn" @click="selectAll(g.group)">Select all</button>
                <button type="button" class="mini-btn" @click="clearAll(g.group)">Clear</button>
              </div>
            </div>

            <div class="items">
              <label v-for="p in g.items" :key="p.code" class="perm">
                <input type="checkbox" :disabled="!p.isActive" :checked="selectedSet.has(p.code)"
                  @change="toggle(p.code)" />
                <div class="perm-text">
                  <div class="perm-name">
                    {{ p.name }}
                    <span v-if="!p.isActive" class="inactive">(inactive)</span>
                  </div>
                  <div class="perm-code">{{ p.code }}</div>
                </div>
              </label>
            </div>
          </div>

          <div v-if="groups.length === 0" class="empty">No permissions found.</div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" type="button" @click="emit('close')" :disabled="saving">Cancel</button>
        <button class="btn-primary" type="button" @click="save" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { userManagementService } from './user-management.service'
import type { PermissionDto } from './user-management.types'

const props = defineProps<{
  userId: string
  email: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const loading = ref(false)
const saving = ref(false)
const q = ref('')

const all = ref<PermissionDto[]>([])
const selectedSet = ref<Set<string>>(new Set<string>())

const load = async () => {
  loading.value = true
  try {
    const res = await userManagementService.getUserPermissions(props.userId)
    all.value = res.all
    selectedSet.value = new Set<string>(res.assigned)
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return all.value
  return all.value.filter((p) => (p.name + ' ' + p.code + ' ' + p.group).toLowerCase().includes(term))
})

const groups = computed(() => {
  const map = new Map<string, PermissionDto[]>()
  for (const p of filtered.value) {
    const key = p.group || 'Other'
    const arr = map.get(key) ?? []
    arr.push(p)
    map.set(key, arr)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, items]) => ({
      group,
      items: items.sort((x, y) => x.name.localeCompare(y.name)),
    }))
})

const toggle = (code: string) => {
  const s = new Set(selectedSet.value)
  if (s.has(code)) s.delete(code)
  else s.add(code)
  selectedSet.value = s
}

const selectAll = (group: string) => {
  const s = new Set(selectedSet.value)
  for (const p of all.value) {
    if (p.group === group && p.isActive) s.add(p.code)
  }
  selectedSet.value = s
}

const clearAll = (group: string) => {
  const s = new Set(selectedSet.value)
  for (const p of all.value) {
    if (p.group === group) s.delete(p.code)
  }
  selectedSet.value = s
}

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    await userManagementService.updateUserPermissions(props.userId, {
      permissions: Array.from(selectedSet.value),
    })
    emit('saved')
    emit('close')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 30px 16px;
  overflow: auto;
}

.modal-card {
  width: 980px;
  max-width: 96vw;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, .22);
  border: 1px solid rgba(0, 0, 0, .06);
}

.modal-header {
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eef2f7;
}

.modal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 950;
}

.modal-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

.icon-btn {
  height: 36px;
  width: 36px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 14px 18px;
  max-height: 72vh;
  overflow: auto;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.search {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 12px;
  width: 420px;
  max-width: 100%;
  font-weight: 800;
}

.hint {
  font-size: 12px;
  color: #6b7280;
  font-weight: 800;
}

.loading {
  padding: 18px;
  font-weight: 800;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  overflow: hidden;
}

.group-header {
  background: #f9fafb;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-title {
  font-weight: 950;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.mini-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 900;
  cursor: pointer;
  font-size: 12px;
}

.items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px;
}

.perm {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #f0f2f5;
}

.perm:hover {
  background: #fbfbfc;
}

.perm input {
  margin-top: 3px;
  height: 16px;
  width: 16px;
}

.perm-text {
  display: flex;
  flex-direction: column;
}

.perm-name {
  font-weight: 900;
  font-size: 13px;
}

.perm-code {
  font-size: 11px;
  color: #6b7280;
  font-weight: 700;
}

.inactive {
  margin-left: 6px;
  font-size: 11px;
  color: #ef4444;
  font-weight: 900;
}

.empty {
  padding: 16px;
  color: #6b7280;
  font-weight: 800;
}

.modal-footer {
  padding: 14px 18px;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  height: 42px;
  padding: 0 18px;
  border-radius: 14px;
  border: none;
  background: #16a34a;
  color: #fff;
  font-weight: 950;
  cursor: pointer;
}

.btn-secondary {
  height: 42px;
  padding: 0 18px;
  border-radius: 14px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 950;
  cursor: pointer;
}

@media (max-width: 900px) {
  .items {
    grid-template-columns: 1fr;
  }
}
</style>
