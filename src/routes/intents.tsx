import { createRoute } from '@tanstack/react-router'

import { IntentManagementPage } from '@/features/intents/IntentManagementPage'

import { rootRoute } from './__root'

export const intentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/intents',
  component: IntentManagementPage,
})
