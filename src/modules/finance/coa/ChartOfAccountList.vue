<template>
  <div class="patient-page">
    <!-- Header -->
    <div class="page-header">
      <div class="action-bar">
        <button class="btn-add" @click="openAdd">+ Add New</button>
      </div>

      <div class="search-box">
        <input v-model="search" type="search" placeholder="Search here" />
        <span class="icon">🔍</span>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loader-overlay">
      <img src="/loader.gif" width="100" />
    </div>

    <!-- Table -->
    <div v-else class="card">
      <div class="table-wrap">
        <table class="patient-table">
          <thead>
            <tr>
              <th class="text-left col-code">Code</th>
              <th class="text-left col-name">Name</th>
              <th class="text-left col-type">Type</th>
              <th class="text-left col-status">Status</th>
              <th class="text-left col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="a in filteredAccounts" :key="a.Id">
              <td class="col-code">{{ a.Code }}</td>

              <!-- ✅ REAL TREE INDENT (responsive) -->
              <td class="col-name">
                <span class="tree-name" :style="{
                  paddingLeft: `calc(${a._level} * var(--indent))`,
                  fontWeight: a._level === 0 ? '700' : a._level === 1 ? '600' : '500',
                }">
                  {{ a.Name }}
                </span>
              </td>

              <td class="col-type">{{ a.Type }}</td>
              <td class="col-status">{{ a.IsActive ? 'Active' : 'Inactive' }}</td>

              <td class="actions col-actions">
                <button class="icon-btn" type="button" title="Edit" @click="openEdit(a)">
                  ✏️
                </button>
              </td>
            </tr>

            <tr v-if="filteredAccounts.length === 0">
              <td colspan="5" class="no-records">No records</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL -->
    <Teleport to="body">
      <ChartOfAccountFormModal v-if="showForm" :accountId="selectedId" @saved="reload" @close="close" />
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { coaService } from './coa.service'
import type { ChartOfAccountApiDto } from './coa.types'
import ChartOfAccountFormModal from './ChartOfAccountFormModal.vue'

type CoaRow = ChartOfAccountApiDto & { _level: number }

export default defineComponent({
  components: { ChartOfAccountFormModal },

  setup() {
    const rawAccounts = ref<ChartOfAccountApiDto[]>([])
    const accounts = ref<CoaRow[]>([])
    const search = ref('')
    const loading = ref(false)

    const showForm = ref(false)
    const selectedId = ref<string | undefined>(undefined)

    const buildTree = (
      list: ChartOfAccountApiDto[],
      parentId: string | null = null,
      level = 0,
    ): CoaRow[] => {
      return list
        .filter((x) => x.ParentId === parentId)
        .sort((a, b) => a.Code.localeCompare(b.Code))
        .flatMap((x) => [{ ...x, _level: level }, ...buildTree(list, x.Id, level + 1)])
    }

    const loadAccounts = async () => {
      loading.value = true
      rawAccounts.value = await coaService.getAll()
      accounts.value = buildTree(rawAccounts.value)
      loading.value = false
    }

    const filteredAccounts = computed(() => {
      if (!search.value) return accounts.value
      const t = search.value.toLowerCase()
      return accounts.value.filter((a) => (a.Code + a.Name + a.Type).toLowerCase().includes(t))
    })

    const openAdd = () => {
      selectedId.value = undefined
      showForm.value = true
    }

    const openEdit = (a: ChartOfAccountApiDto) => {
      selectedId.value = a.Id
      showForm.value = true
    }

    const close = () => {
      showForm.value = false
      selectedId.value = undefined
    }

    const reload = async () => {
      close()
      await loadAccounts()
    }

    onMounted(loadAccounts)

    return {
      search,
      loading,
      filteredAccounts,
      showForm,
      selectedId,
      openAdd,
      openEdit,
      close,
      reload,
    }
  },
})
</script>

<style scoped>
.patient-page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

/* header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.action-bar {
  margin: 0;
}

/* ✅ search pill */
.search-box {
  position: relative;
  width: 100%;
  max-width: 420px;
}

.search-box input {
  width: 100%;
  height: 44px;
  line-height: 44px;
  padding: 0 44px 0 16px;
  border-radius: 999px;
  border: 1px solid #d8e3d8;
  background: #fff;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.search-box input:focus {
  border-color: #34c759;
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.15);
}

.search-box .icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  height: 22px;
  width: 22px;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: 0.85;
}

/* button */
.btn-add {
  height: 44px;
  background: #34c759;
  color: #fff;
  border: none;
  padding: 0 18px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}

/* card + table */
.card {
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.patient-table {
  width: 100%;
  min-width: 900px;
  /* COA name + indent needs space */
  border-collapse: collapse;
}

.patient-table th,
.patient-table td {
  padding: 14px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
  text-align: left;
}

.patient-table tbody tr:hover {
  background: #f7fbf7;
}

.no-records {
  text-align: center;
  padding: 18px;
  color: #6b7280;
}

/* ✅ tree name */
:root,
.patient-page {
  --indent: 24px;
  /* default indent */
}

.tree-name {
  display: inline-block;
  white-space: nowrap;
}

/* actions buttons */
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 6px;
  border-radius: 8px;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.loader-overlay {
  display: flex;
  justify-content: center;
  padding: 40px;
}

/* ✅ mobile tuning */
@media (max-width: 640px) {
  .patient-page {
    padding: 14px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    width: 100%;
  }

  .search-box {
    max-width: 100%;
  }

  .card {
    padding: 8px;
  }

  /* reduce indent on mobile */
  .patient-page {
    --indent: 14px;
  }

  /* optional: hide Type column on small screens */
  .col-type,
  th.col-type {
    display: none;
  }

  .patient-table {
    min-width: 720px;
  }
}
</style>
