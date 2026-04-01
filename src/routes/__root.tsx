import { Outlet, createRootRoute } from '@tanstack/react-router'

export const rootRoute = createRootRoute({
  component: Outlet,
  errorComponent: () => <p>Something went wrong. Please try again.</p>,
})
