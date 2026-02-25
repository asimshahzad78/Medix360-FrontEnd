<!-- src/modules/user-management/UserList.vue -->
<template>
  <div class="page">
    <div class="header card">
      <div>
        <h2 class="title">Users</h2>
        <div class="sub">Enable/disable users, assign Job Role, and manage permissions.</div>
      </div>

      <div class="controls">
        <input v-model="search" class="search" placeholder="Search email..." />
      </div>
    </div>

    <div v-if="loading" class="card loading">Loading...</div>

    <div v-else class="card">
      <table class="tbl">
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Job Role</th>
            <th class="right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td class="mono">{{ u.email }}</td>

            <td>
              <label class="switch">
                <input type="checkbox" :checked="u.isActive" @change="toggleStatus(u)" />
                <span class="slider"></span>
              </label>
              <span class="status" :class="{ off: !u.isActive }">
                {{ u.isActive ? 'Active' : 'Disabled' }}
              </span>
            </td>

            <td>
              <select class="select" :value="u.jobRoleId ?? ''" @change="changeJobRole(u, $event)">
                <option value="">Select</option>
                <option v-for="r in jobRoles" :key="r.id" :value="String(r.id)">
                  {{ r.name }}
                </option>
              </select>
              <div class="muted" v-if="u.jobRoleName">{{ u.jobRoleName }}</div>
            </td>

            <td class="right">
              <button class="btn" type="button" @click="openPermissions(u)">Permissions</button>
              <button class="btn danger" type="button" @click="openReset(u)">Reset Password</button>

            </td>
          </tr>

          <tr v-if="users.length === 0">
            <td colspan="4" class="empty">No users found.</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <span>Showing {{ startRecord }} - {{ endRecord }} of {{ totalCount }}</span>

        <div class="pager">
          <button class="btn2" :disabled="page === 1" @click="go(page - 1)">Prev</button>
          <span>Page {{ page }}</span>
          <button class="btn2" :disabled="page * pageSize >= totalCount" @click="go(page + 1)">Next</button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <UserPermissionsModal v-if="showPerms && selected" :userId="selected.id" :email="selected.email"
        @close="closePerms" @saved="reload" />
    </Teleport>
    <Teleport to="body">
      <UserResetPasswordModal v-if="showReset && selected" :userId="selected.id" :email="selected.email"
        @close="closeReset" @saved="closeReset" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { userManagementService } from './user-management.service'
import type { JobRoleDto, UserRowDto } from './user-management.types'
import UserPermissionsModal from './UserPermissionsModal.vue'
import UserResetPasswordModal from './UserResetPasswordModal.vue'

const loading = ref(false)
const users = ref<UserRowDto[]>([])

const jobRoles = ref<JobRoleDto[]>([])

const page = ref(1)
const pageSize = ref(25)
const totalCount = ref(0)
const search = ref('')

const showPerms = ref(false)
const selected = ref<UserRowDto | null>(null)

const loadJobRoles = async () => {
  jobRoles.value = await userManagementService.getJobRoles()
}

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await userManagementService.getUsers(page.value, pageSize.value, search.value)
    users.value = res.items
    totalCount.value = res.totalCount
  } finally {
    loading.value = false
  }
}

const reload = () => {
  void loadUsers()
}

const go = (p: number) => {
  page.value = p
  void loadUsers()
}

const toggleStatus = async (u: UserRowDto) => {
  const next = !u.isActive
  await userManagementService.updateStatus(u.id, { isActive: next })
  u.isActive = next
}

const changeJobRole = async (u: UserRowDto, e: Event) => {
  const target = e.target
  if (!(target instanceof HTMLSelectElement)) return

  const v = target.value.trim()
  const jobRoleId = v ? Number(v) : null

  await userManagementService.updateJobRole(u.id, { jobRoleId })

  u.jobRoleId = jobRoleId
  u.jobRoleName = jobRoleId ? jobRoles.value.find((x) => x.id === jobRoleId)?.name ?? null : null
}

const showReset = ref(false)

const openReset = (u: UserRowDto) => {
  selected.value = u
  showReset.value = true
}

const closeReset = () => {
  showReset.value = false
  // keep selected for perms? if you want shared, keep it.
  selected.value = null
}

const openPermissions = (u: UserRowDto) => {
  selected.value = u
  showPerms.value = true
}

const closePerms = () => {
  showPerms.value = false
  selected.value = null
}

watch(search, () => {
  page.value = 1
  void loadUsers()
})

const startRecord = computed(() => (totalCount.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const endRecord = computed(() => Math.min(page.value * pageSize.value, totalCount.value))

onMounted(async () => {
  await loadJobRoles()
  await loadUsers()
})
</script>

<style scoped>
.page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, .06);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 12px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 950;
}

.sub {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 12px;
  width: 320px;
  font-weight: 800;
}

.loading {
  font-weight: 900;
}

.tbl {
  width: 100%;
  border-collapse: collapse;
}

.tbl th,
.tbl td {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.tbl th {
  font-weight: 950;
}

.right {
  text-align: right;
}

.empty {
  text-align: center;
  padding: 18px;
  color: #6b7280;
  font-weight: 800;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
}

.select {
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 10px;
  font-weight: 800;
}

.btn.danger {
  background: #b91c1c;
  margin-left: 8px;
}

.muted {
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;
  font-weight: 700;
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

.btn2 {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn2:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.pager {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status {
  margin-left: 10px;
  font-weight: 900;
}

.status.off {
  color: #b91c1c;
}

/* toggle switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
  vertical-align: middle;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #d1d5db;
  border-radius: 999px;
  transition: .2s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  top: 2px;
  background: white;
  border-radius: 50%;
  transition: .2s;
}

.switch input:checked+.slider {
  background: #16a34a;
}

.switch input:checked+.slider:before {
  transform: translateX(22px);
}
</style>
