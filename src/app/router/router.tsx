import { createRouter } from '@tanstack/react-router'

import { rootRoute } from '../../routes/__root'
import { indexRoute } from '../../routes/index'
import { intentsRoute } from '../../routes/intents'

const routeTree = rootRoute.addChildren([indexRoute, intentsRoute])

export const router = createRouter({ routeTree })
