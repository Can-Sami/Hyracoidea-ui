import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { router } from '../router/router'

const queryClient = new QueryClient()

function shouldRenderDevtools() {
  return import.meta.env.MODE === 'development'
}

export function AppProviders() {
  const showDevtools = shouldRenderDevtools()

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {showDevtools ? (
        <>
          <TanStackRouterDevtools />
          <ReactQueryDevtools initialIsOpen={false} />
        </>
      ) : null}
    </QueryClientProvider>
  )
}
