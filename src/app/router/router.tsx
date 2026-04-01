import { createRouter } from '@tanstack/react-router'

import { rootRoute } from '../../routes/__root'
import { indexRoute } from '../../routes/index'
import { intentsRoute } from '../../routes/intents'
import { testLabRoute } from '../../routes/test-lab'

const routeTree = rootRoute.addChildren([indexRoute, intentsRoute, testLabRoute])

export const router = createRouter({ routeTree })
