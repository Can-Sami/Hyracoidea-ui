import { createRoute } from '@tanstack/react-router'

import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <main>
      <h1>Home</h1>
      <p>Baseline route is ready.</p>
    </main>
  ),
})
