import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createMemoryHistory,
  createRoute,
  createRouter,
} from '@tanstack/react-router'

import { indexRoute } from './index'
import { analyticsRoute } from './analytics'
import { intentsRoute } from './intents'
import { intentsUtterancesRoute } from './intents-utterances'
import { testLabRoute } from './test-lab'
import { rootRoute } from './__root'

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('router navigation', () => {
  it('renders overview dashboard content for the / route', async () => {
    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })

    renderWithProviders(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: /overview dashboard/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/recent inference activity/i)).toBeInTheDocument()
  })

  it('renders friendly fallback from root error boundary', async () => {
    const crashingRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/crash-test',
      component: () => {
        throw new Error('Route crashed')
      },
    })

    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute, crashingRoute]),
      history: createMemoryHistory({ initialEntries: ['/crash-test'] }),
    })

    renderWithProviders(<RouterProvider router={router} />)

    expect(
      await screen.findByText(/something went wrong\. please try again\./i),
    ).toBeInTheDocument()
  })

  it('renders intent management page at /intents', async () => {
    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute, intentsRoute]),
      history: createMemoryHistory({ initialEntries: ['/intents'] }),
    })

    renderWithProviders(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: /intent management/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/intent manifest/i)).toBeInTheDocument()
  })

  it('renders test lab page at /test-lab', async () => {
    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute, intentsRoute, testLabRoute]),
      history: createMemoryHistory({ initialEntries: ['/test-lab'] }),
    })

    renderWithProviders(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: /test & inference lab/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/semantic search/i)).toBeInTheDocument()
    expect(screen.getByText(/audio inference/i)).toBeInTheDocument()
  })

  it('renders analytics page at /analytics', async () => {
    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute, analyticsRoute]),
      history: createMemoryHistory({ initialEntries: ['/analytics'] }),
    })

    renderWithProviders(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: /stage analytics/i })).toBeInTheDocument()
    expect(
      screen.getByText(/benchmark comparison \(candidate vs baseline\)/i),
    ).toBeInTheDocument()
  })

  it('renders utterance management page at /intents/:id/utterances', async () => {
    const router = createRouter({
      routeTree: rootRoute.addChildren([
        indexRoute,
        intentsRoute,
        intentsUtterancesRoute,
        testLabRoute,
      ]),
      history: createMemoryHistory({
        initialEntries: ['/intents/intent-1/utterances'],
      }),
    })

    renderWithProviders(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: /utterance management/i }),
    ).toBeInTheDocument()
  })
})
