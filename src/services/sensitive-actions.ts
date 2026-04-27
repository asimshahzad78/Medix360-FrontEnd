export type SensitiveActionType =
  | 'cancel'
  | 'refund'
  | 'reverse'
  | 'post'
  | 'approve'
  | 'verify'
  | 'dispense'
  | 'stock-movement'

export type SensitiveActionRequest = {
  type: SensitiveActionType
  label: string
  target?: string
}

const actionText: Record<SensitiveActionType, string> = {
  cancel: 'Cancel',
  refund: 'Refund',
  reverse: 'Reverse',
  post: 'Post',
  approve: 'Approve',
  verify: 'Verify',
  dispense: 'Dispense',
  'stock-movement': 'Stock movement',
}

export const getSensitiveActionLabel = (action: SensitiveActionRequest): string => {
  const base = action.label || actionText[action.type]
  return action.target ? `${base}: ${action.target}` : base
}
