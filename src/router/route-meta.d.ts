import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    layout?: string
    permissions?: string[]
    public?: boolean
  }
}

