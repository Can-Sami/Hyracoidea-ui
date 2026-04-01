import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterContextProvider } from '@tanstack/react-router'
import { type PropsWithChildren } from 'react'

import { router } from '../router/router'

const queryClient = new QueryClient()

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterContextProvider router={router}>{children}</RouterContextProvider>
    </QueryClientProvider>
  )
}
