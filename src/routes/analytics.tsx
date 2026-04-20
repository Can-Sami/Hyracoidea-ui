import { createRoute } from '@tanstack/react-router'

import AnalyticsPage from '@/features/analytics/AnalyticsPage'

import { rootRoute } from './__root'

export const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
})
