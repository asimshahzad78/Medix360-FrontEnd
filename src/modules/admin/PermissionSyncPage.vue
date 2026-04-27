<template>
  <div class="sync-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">Administration</p>
        <h2>Permission Backend Sync</h2>
        <p class="subtitle">Compare frontend permission names with backend seeded permissions.</p>
      </div>

      <button type="button" class="primary" :disabled="loading" @click="load">Refresh</button>
    </section>

    <AppProblemDetails v-if="loadError" :problem="loadError" fallback-title="Could not load backend permissions" />

    <section class="summary-grid">
      <article class="summary-card">
        <span>Frontend Expected</span>
        <strong>{{ frontendCount }}</strong>
        <small>Permission constants in UI</small>
      </article>
      <article class="summary-card">
        <span>Backend Seeded</span>
        <strong>{{ backendPermissions.size }}</strong>
        <small>Loaded from permissions API</small>
      </article>
      <article class="summary-card" :class="{ danger: missingCount > 0 }">
        <span>Missing In Backend</span>
        <strong>{{ missingCount }}</strong>
        <small>Must be seeded or renamed</small>
      </article>
    </section>

    <AppLoadingState v-if="loading" label="Checking permission coverage..." />

    <section v-else class="group-grid">
      <article v-for="group in groups" :key="group.name" class="panel">
        <div class="panel-title">
          <div>
            <h3>{{ group.name }}</h3>
            <span>{{ group.missing.length }} missing of {{ group.permissions.length }}</span>
          </div>
          <span class="badge" :class="{ ok: group.missing.length === 0, danger: group.missing.length > 0 }">
            {{ group.missing.length === 0 ? 'Synced' : 'Needs backend' }}
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Permission</th>
              <th>Backend</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="permission in group.permissions" :key="permission">
              <td class="mono">{{ permission }}</td>
              <td>
                <span class="badge" :class="{ ok: backendPermissions.has(permission), danger: !backendPermissions.has(permission) }">
                  {{ backendPermissions.has(permission) ? 'Present' : 'Missing' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import AppProblemDetails from '@/components/ui/AppProblemDetails.vue'
import { hrLookupsService } from '@/modules/hr/hr-lookups.service'
import {
  FRONTEND_PERMISSION_CODES,
  PERMISSION_BACKEND_SYNC_GROUPS,
  type PermissionCode,
} from '@/security/permissions'
import { createMutationState, runMutation } from '@/services/mutations'

const backendPermissions = ref(new Set<string>())
const loadState = createMutationState()

const loading = computed(() => loadState.loading.value)
const loadError = computed(() => loadState.error.value)
const frontendCount = computed(() => FRONTEND_PERMISSION_CODES.length)

const groups = computed(() =>
  Object.entries(PERMISSION_BACKEND_SYNC_GROUPS).map(([name, permissions]) => ({
    name,
    permissions,
    missing: permissions.filter((permission) => !backendPermissions.value.has(permission)),
  })),
)

const missingCount = computed(() =>
  groups.value.reduce((total, group) => total + group.missing.length, 0),
)

const extractPermissionCode = (permission: { Code?: string | null; Name?: string | null }): string | null =>
  permission.Code || permission.Name || null

const load = async () => {
  const allCodes = new Set<string>()
  let page = 1
  let totalCount = 0

  const result = await runMutation(
    loadState,
    async () => {
      do {
        const response = await hrLookupsService.getPermissions({ page, pageSize: 200 })
        totalCount = response.totalCount
        response.items
          .map(extractPermissionCode)
          .filter((code): code is PermissionCode => Boolean(code))
          .forEach((code) => allCodes.add(code))
        page += 1
      } while (allCodes.size < totalCount && totalCount > 0)

      return allCodes
    },
    {
      showErrorToast: false,
      showSuccessToast: false,
    },
  )

  if (result) backendPermissions.value = result
}

onMounted(load)
</script>

<style scoped>
.sync-page {
  min-height: 100vh;
  background: #f4f9f4;
  padding: 24px;
}

.page-header,
.summary-card,
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.eyebrow,
.subtitle,
.summary-card span,
.summary-card small,
.panel-title span {
  color: #64748b;
  font-size: 13px;
}

.eyebrow {
  margin: 0 0 4px;
  font-weight: 800;
  text-transform: uppercase;
}

h2,
h3,
p {
  margin: 0;
}

h2,
h3 {
  color: #0f172a;
}

.subtitle {
  margin-top: 6px;
}

button {
  border: 1px solid #166534;
  background: #166534;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  padding: 9px 12px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  padding: 14px;
}

.summary-card strong {
  display: block;
  color: #0f172a;
  font-size: 24px;
  margin: 4px 0;
}

.summary-card.danger {
  border-color: #fecaca;
  background: #fff7f7;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.panel {
  padding: 16px;
  min-width: 0;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  padding: 10px;
}

th {
  color: #475569;
  font-size: 12px;
  text-transform: uppercase;
}

.mono {
  color: #334155;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
}

.badge {
  display: inline-flex;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 9px;
}

.badge.ok {
  background: #dcfce7;
  color: #166534;
}

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

@media (max-width: 1000px) {
  .summary-grid,
  .group-grid {
    grid-template-columns: 1fr;
  }
}
</style>
