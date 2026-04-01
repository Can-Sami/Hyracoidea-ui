import { createRoute } from '@tanstack/react-router'

import TestLabPage from '@/features/test-lab/TestLabPage'

import { rootRoute } from './__root'

export const testLabRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/test-lab',
  component: TestLabPage,
})
