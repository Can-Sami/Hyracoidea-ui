import { createRouter } from '@tanstack/react-router'

import { rootRoute } from '../../routes/__root'
import { indexRoute } from '../../routes/index'
import { intentsRoute } from '../../routes/intents'
import { intentsUtterancesRoute } from '../../routes/intents-utterances'
import { testLabRoute } from '../../routes/test-lab'

const routeTree = rootRoute.addChildren([
  indexRoute,
  intentsRoute,
  intentsUtterancesRoute,
  testLabRoute,
])

export const router = createRouter({ routeTree })
