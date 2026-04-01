import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

import { AppProviders } from './AppProviders'

vi.mock('@tanstack/router-devtools', () => ({
  TanStackRouterDevtools: () => <div data-testid="router-devtools" />,
}))

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="query-devtools" />,
}))

describe('AppProviders', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
  })

  it('mounts the app with router-rendered content', async () => {
    render(<AppProviders />)

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument()
  })

  it('mounts router/query devtools in development', () => {
    vi.stubEnv('MODE', 'development')

    render(<AppProviders />)

    expect(screen.getByTestId('router-devtools')).toBeInTheDocument()
    expect(screen.getByTestId('query-devtools')).toBeInTheDocument()
  })

  it('does not mount router/query devtools in production', () => {
    vi.stubEnv('MODE', 'production')

    render(<AppProviders />)

    expect(screen.queryByTestId('router-devtools')).not.toBeInTheDocument()
    expect(screen.queryByTestId('query-devtools')).not.toBeInTheDocument()
  })
})
