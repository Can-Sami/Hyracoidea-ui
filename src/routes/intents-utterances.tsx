import { createRoute } from '@tanstack/react-router'

import IntentUtterancesPage from '@/features/intents/IntentUtterancesPage'

import { rootRoute } from './__root'

export const intentsUtterancesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/intents/$intentId/utterances',
  component: IntentUtterancesPage,
})
