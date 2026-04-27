import { defineStore } from 'pinia'

export type ConfirmationVariant = 'default' | 'danger'

export type ConfirmationRequest = {
  id: string
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  variant: ConfirmationVariant
  resolve: (confirmed: boolean) => void
}

const createId = () => `confirm-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const useConfirmationStore = defineStore('confirmation', {
  state: () => ({
    current: null as ConfirmationRequest | null,
  }),

  actions: {
    request(options: {
      title: string
      message: string
      confirmLabel?: string
      cancelLabel?: string
      variant?: ConfirmationVariant
    }) {
      return new Promise<boolean>((resolve) => {
        this.current = {
          id: createId(),
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel ?? 'Confirm',
          cancelLabel: options.cancelLabel ?? 'Cancel',
          variant: options.variant ?? 'default',
          resolve,
        }
      })
    },

    confirm() {
      this.current?.resolve(true)
      this.current = null
    },

    cancel() {
      this.current?.resolve(false)
      this.current = null
    },
  },
})
