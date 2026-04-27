import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type ToastMessage = {
  id: string
  type: ToastType
  title: string
  message?: string
  timeoutMs: number
}

const createId = () => `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [] as ToastMessage[],
  }),

  actions: {
    show(toast: Omit<ToastMessage, 'id' | 'timeoutMs'> & { timeoutMs?: number }) {
      const item: ToastMessage = {
        id: createId(),
        timeoutMs: toast.timeoutMs ?? 4500,
        type: toast.type,
        title: toast.title,
        message: toast.message,
      }

      this.items.push(item)

      if (item.timeoutMs > 0) {
        window.setTimeout(() => this.dismiss(item.id), item.timeoutMs)
      }

      return item.id
    },

    success(title: string, message?: string) {
      return this.show({ type: 'success', title, message })
    },

    error(title: string, message?: string) {
      return this.show({ type: 'error', title, message, timeoutMs: 7000 })
    },

    warning(title: string, message?: string) {
      return this.show({ type: 'warning', title, message })
    },

    info(title: string, message?: string) {
      return this.show({ type: 'info', title, message })
    },

    dismiss(id: string) {
      this.items = this.items.filter((item) => item.id !== id)
    },
  },
})
