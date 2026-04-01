import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import { router } from '../router/router'

const queryClient = new QueryClient()
const Devtools = import.meta.env.DEV ? lazy(() => import('./AppDevtools')) : null

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {Devtools ? (
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  )
}
