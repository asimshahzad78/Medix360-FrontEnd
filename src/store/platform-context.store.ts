import { defineStore } from 'pinia'
import {
  getPlatformContext,
  writePlatformContext,
  type PlatformContext,
  type PlatformContextInput,
} from '@/services/systemContext'

interface PlatformContextState {
  active: PlatformContext
}

export const usePlatformContextStore = defineStore('platformContext', {
  state: (): PlatformContextState => ({
    active: getPlatformContext(),
  }),

  getters: {
    hasTenant: (state) => Boolean(state.active.tenantId),
    hasFacility: (state) => Boolean(state.active.facilityId || state.active.propertyId),
    displayFacility: (state) => state.active.facilityId || state.active.propertyId || 'No facility',
  },

  actions: {
    update(context: PlatformContextInput) {
      this.active = writePlatformContext(context)
    },
  },
})
