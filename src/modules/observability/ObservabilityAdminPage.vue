<template>
  <div class="observability-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">Platform Operations</p>
        <h2>Observability Admin</h2>
        <p class="subtitle">Review health checks, runtime status, background jobs, outbox retries, and metrics.</p>
      </div>

      <div class="header-actions">
        <a class="link-button" :href="metricsUrl" target="_blank" rel="noreferrer">Open Metrics</a>
        <button type="button" :disabled="refreshing" class="primary" @click="refreshAll">Refresh</button>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card" :class="statusClass(healthSummary.status)">
        <span>Health Checks</span>
        <strong>{{ healthSummary.status }}</strong>
        <small>{{ health.length }} checks loaded</small>
      </article>
      <article class="summary-card" :class="statusClass(runtime.status)">
        <span>Runtime</span>
        <strong>{{ runtime.status || 'Unknown' }}</strong>
        <small>{{ runtime.environment || 'Environment unavailable' }}</small>
      </article>
      <article class="summary-card" :class="statusClass(jobsSummary.status)">
        <span>Background Jobs</span>
        <strong>{{ jobsSummary.status }}</strong>
        <small>{{ jobsSummary.detail }}</small>
      </article>
      <article class="summary-card" :class="statusClass(outboxSummary.status)">
        <span>Outbox / Retry</span>
        <strong>{{ outboxSummary.status }}</strong>
        <small>{{ outboxSummary.detail }}</small>
      </article>
    </section>

    <section class="workspace-grid">
      <article class="panel">
        <div class="panel-title">
          <div>
            <h3>Health Checks</h3>
            <span>Root health endpoint</span>
          </div>
          <button type="button" :disabled="healthState.loading.value" @click="loadHealth">Refresh</button>
        </div>

        <AppProblemDetails v-if="healthState.error.value" :problem="healthState.error.value" fallback-title="Health checks unavailable" />
        <AppLoadingState v-else-if="healthState.loading.value" label="Loading health checks..." />
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Check</th>
                <th>Status</th>
                <th>Description</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="check in health" :key="check.name">
                <td>{{ check.name }}</td>
                <td><span class="status" :class="statusClass(check.status)">{{ check.status }}</span></td>
                <td>{{ check.description || '-' }}</td>
                <td>{{ check.duration || '-' }}</td>
              </tr>
              <tr v-if="health.length === 0">
                <td colspan="4" class="empty-cell">No health check rows returned.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="panel">
        <div class="panel-title">
          <div>
            <h3>Runtime Observability</h3>
            <span>/observability/runtime</span>
          </div>
          <button type="button" :disabled="runtimeState.loading.value" @click="loadRuntime">Refresh</button>
        </div>

        <AppProblemDetails v-if="runtimeState.error.value" :problem="runtimeState.error.value" fallback-title="Runtime unavailable" />
        <AppLoadingState v-else-if="runtimeState.loading.value" label="Loading runtime..." />
        <dl v-else class="runtime-list">
          <div>
            <dt>Environment</dt>
            <dd>{{ runtime.environment || '-' }}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{{ runtime.version || '-' }}</dd>
          </div>
          <div>
            <dt>Uptime</dt>
            <dd>{{ runtime.uptime || '-' }}</dd>
          </div>
          <div>
            <dt>Machine</dt>
            <dd>{{ runtime.machineName || '-' }}</dd>
          </div>
          <div>
            <dt>Process</dt>
            <dd>{{ runtime.processId || '-' }}</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>{{ runtime.runtime || '-' }}</dd>
          </div>
          <div>
            <dt>Memory</dt>
            <dd>{{ runtime.memory || '-' }}</dd>
          </div>
        </dl>
      </article>
    </section>

    <section class="workspace-grid bottom">
      <article class="panel">
        <div class="panel-title">
          <div>
            <h3>Background Jobs</h3>
            <span>Scheduler and worker health</span>
          </div>
          <button type="button" :disabled="jobsState.loading.value" @click="loadJobs">Refresh</button>
        </div>

        <AppProblemDetails v-if="jobsState.error.value" :problem="jobsState.error.value" fallback-title="Background jobs unavailable" />
        <AppLoadingState v-else-if="jobsState.loading.value" label="Loading background jobs..." />
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>Status</th>
                <th>Last Run</th>
                <th>Next Run</th>
                <th>Failures</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in jobs" :key="job.name">
                <td>{{ job.name }}</td>
                <td><span class="status" :class="statusClass(job.status)">{{ job.status }}</span></td>
                <td>{{ formatDate(job.lastRun) }}</td>
                <td>{{ formatDate(job.nextRun) }}</td>
                <td>{{ job.failures ?? 0 }}</td>
              </tr>
              <tr v-if="jobs.length === 0">
                <td colspan="5" class="empty-cell">No background jobs returned.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="panel">
        <div class="panel-title">
          <div>
            <h3>Outbox / Retry Status</h3>
            <span>Integration delivery queues</span>
          </div>
          <button type="button" :disabled="outboxState.loading.value" @click="loadOutbox">Refresh</button>
        </div>

        <AppProblemDetails v-if="outboxState.error.value" :problem="outboxState.error.value" fallback-title="Outbox status unavailable" />
        <AppLoadingState v-else-if="outboxState.loading.value" label="Loading retry queues..." />
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Queue</th>
                <th>Status</th>
                <th>Pending</th>
                <th>Failed</th>
                <th>Last Processed</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="queue in outbox" :key="queue.queue">
                <td>{{ queue.queue }}</td>
                <td><span class="status" :class="statusClass(queue.status)">{{ queue.status }}</span></td>
                <td>{{ queue.pending ?? 0 }}</td>
                <td>{{ queue.failed ?? 0 }}</td>
                <td>{{ formatDate(queue.lastProcessedAt) }}</td>
              </tr>
              <tr v-if="outbox.length === 0">
                <td colspan="5" class="empty-cell">No outbox queues returned.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import AppProblemDetails from '@/components/ui/AppProblemDetails.vue'
import {
  metricsUrl,
  observabilityService,
  type BackgroundJobStatus,
  type HealthCheckItem,
  type OutboxRetryStatus,
  type RuntimeObservability,
} from '@/services/observability.service'
import { createMutationState, runMutation } from '@/services/mutations'

const health = ref<HealthCheckItem[]>([])
const runtime = ref<RuntimeObservability>({})
const jobs = ref<BackgroundJobStatus[]>([])
const outbox = ref<OutboxRetryStatus[]>([])

const healthState = createMutationState()
const runtimeState = createMutationState()
const jobsState = createMutationState()
const outboxState = createMutationState()

const refreshing = computed(
  () =>
    healthState.loading.value ||
    runtimeState.loading.value ||
    jobsState.loading.value ||
    outboxState.loading.value,
)

const healthSummary = computed(() => {
  if (healthState.error.value) return { status: 'Down', detail: 'Health endpoint failed' }
  if (!health.value.length) return { status: 'Unknown', detail: 'No checks loaded' }

  const unhealthy = health.value.some((check) => !isHealthy(check.status))
  return {
    status: unhealthy ? 'Degraded' : 'Healthy',
    detail: `${health.value.length} checks`,
  }
})

const jobsSummary = computed(() => {
  if (jobsState.error.value) return { status: 'Down', detail: 'Job status failed' }
  const failures = jobs.value.reduce((total, job) => total + Number(job.failures ?? 0), 0)
  const failedJobs = jobs.value.filter((job) => isBad(job.status)).length
  return {
    status: failedJobs || failures ? 'Degraded' : jobs.value.length ? 'Healthy' : 'Unknown',
    detail: `${jobs.value.length} jobs, ${failures} failures`,
  }
})

const outboxSummary = computed(() => {
  if (outboxState.error.value) return { status: 'Down', detail: 'Outbox status failed' }
  const failed = outbox.value.reduce((total, queue) => total + Number(queue.failed ?? 0), 0)
  const pending = outbox.value.reduce((total, queue) => total + Number(queue.pending ?? 0), 0)
  return {
    status: failed ? 'Degraded' : outbox.value.length ? 'Healthy' : 'Unknown',
    detail: `${pending} pending, ${failed} failed`,
  }
})

const isHealthy = (status?: string): boolean =>
  ['healthy', 'up', 'ok', 'ready', 'running', 'success'].includes(String(status ?? '').toLowerCase())

const isBad = (status?: string): boolean =>
  ['down', 'unhealthy', 'failed', 'error', 'critical'].includes(String(status ?? '').toLowerCase())

const statusClass = (status?: string): string => {
  const normalized = String(status ?? '').toLowerCase()
  if (isHealthy(normalized)) return 'good'
  if (isBad(normalized)) return 'bad'
  if (['degraded', 'warning', 'warn', 'pending', 'retrying'].includes(normalized)) return 'warn'
  return 'neutral'
}

const loadHealth = async () => {
  const data = await runMutation(healthState, observabilityService.getHealth, {
    showErrorToast: false,
    showSuccessToast: false,
  })
  if (data) health.value = data
}

const loadRuntime = async () => {
  const data = await runMutation(runtimeState, observabilityService.getRuntime, {
    showErrorToast: false,
    showSuccessToast: false,
  })
  if (data) runtime.value = data
}

const loadJobs = async () => {
  const data = await runMutation(jobsState, observabilityService.getBackgroundJobs, {
    showErrorToast: false,
    showSuccessToast: false,
  })
  if (data) jobs.value = data
}

const loadOutbox = async () => {
  const data = await runMutation(outboxState, observabilityService.getOutboxStatus, {
    showErrorToast: false,
    showSuccessToast: false,
  })
  if (data) outbox.value = data
}

const refreshAll = async () => {
  await Promise.all([loadHealth(), loadRuntime(), loadJobs(), loadOutbox()])
}

const formatDate = (value?: string | null): string => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

onMounted(refreshAll)
</script>

<style scoped>
.observability-page {
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
p,
dl {
  margin: 0;
}

h2,
h3 {
  color: #0f172a;
}

.subtitle {
  margin-top: 6px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

button,
.link-button {
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 6px;
  color: #0f172a;
  font-size: 13px;
  padding: 9px 12px;
  text-decoration: none;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

button.primary {
  border-color: #166534;
  background: #166534;
  color: #fff;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  border-left-width: 5px;
  padding: 14px;
}

.summary-card strong {
  display: block;
  color: #0f172a;
  font-size: 24px;
  margin: 4px 0;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 16px;
}

.workspace-grid.bottom {
  grid-template-columns: 1fr 1fr;
  margin-top: 16px;
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

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

th,
td {
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
  vertical-align: top;
}

th {
  color: #475569;
  font-size: 12px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status {
  display: inline-flex;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 9px;
}

.good {
  border-left-color: #16a34a;
}

.warn {
  border-left-color: #d97706;
}

.bad {
  border-left-color: #dc2626;
}

.neutral {
  border-left-color: #94a3b8;
}

.status.good {
  background: #dcfce7;
  color: #166534;
}

.status.warn {
  background: #fef3c7;
  color: #92400e;
}

.status.bad {
  background: #fee2e2;
  color: #991b1b;
}

.status.neutral {
  background: #f1f5f9;
  color: #475569;
}

.runtime-list {
  display: grid;
  gap: 10px;
}

.runtime-list div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
}

dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

dd {
  color: #0f172a;
  font-weight: 700;
  text-align: right;
}

.empty-cell {
  color: #64748b;
  text-align: center;
}

@media (max-width: 1100px) {
  .summary-grid,
  .workspace-grid,
  .workspace-grid.bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .observability-page {
    padding: 14px;
  }

  .page-header,
  .panel-title,
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
