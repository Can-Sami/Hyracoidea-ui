import { createRoute } from '@tanstack/react-router'

import { OverviewDashboardPage } from '@/features/overview/OverviewDashboardPage'

import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: OverviewDashboardPage,
})
