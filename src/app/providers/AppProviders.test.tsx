import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import type { ComponentType } from 'react'

vi.mock('./AppDevtools', () => ({
  default: () => (
    <>
      <div data-testid="router-devtools" />
      <div data-testid="query-devtools" />
    </>
  ),
}))

describe('AppProviders', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function loadAppProviders(): Promise<ComponentType> {
    const module = await import('./AppProviders')
    return module.AppProviders
  }

  it('mounts the app with router-rendered content', async () => {
    vi.stubEnv('DEV', true)
    const AppProviders = await loadAppProviders()

    render(<AppProviders />)

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument()
  })

  it('mounts router/query devtools in development', async () => {
    vi.stubEnv('DEV', true)
    const AppProviders = await loadAppProviders()

    render(<AppProviders />)

    expect(await screen.findByTestId('router-devtools')).toBeInTheDocument()
    expect(await screen.findByTestId('query-devtools')).toBeInTheDocument()
  })

  it('does not mount router/query devtools in production', async () => {
    vi.stubEnv('DEV', false)
    const AppProviders = await loadAppProviders()

    render(<AppProviders />)

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument()
    expect(screen.queryByTestId('router-devtools')).not.toBeInTheDocument()
    expect(screen.queryByTestId('query-devtools')).not.toBeInTheDocument()
  })
})
