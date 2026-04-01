import { render, screen } from '@testing-library/react'
import {
  RouterProvider,
  createMemoryHistory,
  createRoute,
  createRouter,
} from '@tanstack/react-router'

import { indexRoute } from './index'
import { intentsRoute } from './intents'
import { rootRoute } from './__root'

describe('router navigation', () => {
  it('renders overview dashboard content for the / route', async () => {
    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })

    render(<RouterProvider router={router} />)

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

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByText(/something went wrong\. please try again\./i),
    ).toBeInTheDocument()
  })

  it('renders intent management page at /intents', async () => {
    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute, intentsRoute]),
      history: createMemoryHistory({ initialEntries: ['/intents'] }),
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: /intent management/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/library manifest/i)).toBeInTheDocument()
  })
})
