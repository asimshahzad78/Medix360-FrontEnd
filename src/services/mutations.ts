import { ref } from 'vue'
import {
  getApiErrorMessage,
  getProblemDetails,
  type ProblemDetails,
} from '@/services/api-response'
import { useToastStore } from '@/store/toast.store'

export type MutationState = {
  loading: ReturnType<typeof ref<boolean>>
  error: ReturnType<typeof ref<ProblemDetails | null>>
  lastMessage: ReturnType<typeof ref<string>>
}

export const createMutationState = (): MutationState => ({
  loading: ref(false),
  error: ref<ProblemDetails | null>(null),
  lastMessage: ref(''),
})

export const runMutation = async <T>(
  state: MutationState,
  task: () => Promise<T>,
  options: {
    successMessage?: string
    errorMessage?: string
    showSuccessToast?: boolean
    showErrorToast?: boolean
  } = {},
): Promise<T | null> => {
  if (state.loading.value) return null

  const toast = useToastStore()
  state.loading.value = true
  state.error.value = null
  state.lastMessage.value = ''

  try {
    const result = await task()

    if (options.successMessage) {
      state.lastMessage.value = options.successMessage
      if (options.showSuccessToast ?? true) {
        toast.success(options.successMessage)
      }
    }

    return result
  } catch (error) {
    const problem = getProblemDetails(error)
    const message = getApiErrorMessage(error, options.errorMessage ?? 'Operation failed')

    state.error.value = problem
    state.lastMessage.value = message

    if (options.showErrorToast ?? true) {
      toast.error(message, problem?.correlationId ? `Correlation ID: ${problem.correlationId}` : undefined)
    }

    return null
  } finally {
    state.loading.value = false
  }
}
