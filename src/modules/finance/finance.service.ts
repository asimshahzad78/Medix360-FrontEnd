import { api } from '@/services/api'

export interface PaymentAccountDto {
  Id: string
  Name: string
  Code: string
}

export const financeService = {
  /**
   * Cash + Bank Accounts (used in payment modal)
   */
  async getPaymentAccounts(): Promise<PaymentAccountDto[]> {
    const { data } = await api.get<PaymentAccountDto[]>('/ChartOfAccount/payment-accounts')
    return data
  },
}
