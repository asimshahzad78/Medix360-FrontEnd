export interface LoginVM {
  email: string
  password: string
  rememberMe: boolean
  latitude?: string
  longitude?: string
}

export interface ForgotPasswordVM {
  email: string
}

export interface ResetPasswordVM {
  applicationUserId?: string
  email: string
  oldPassword: string
  newPassword: string
  confirmPassword: string
  code?: string
}

export interface AuthUser {
  applicationUserId: string
  firstName: string
  lastName: string
  email: string
  roleId?: number
  userType?: number
}
