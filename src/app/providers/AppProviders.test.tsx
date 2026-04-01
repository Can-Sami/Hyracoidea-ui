import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import { AppProviders } from './AppProviders'

function Probe() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return (
    <div>
      <span data-testid="child">child-content</span>
      <span data-testid="query-mounted">{Boolean(queryClient).toString()}</span>
      <span data-testid="router-mounted">{Boolean(router).toString()}</span>
    </div>
  )
}

describe('AppProviders', () => {
  it('renders wrapped children with query and router providers mounted', () => {
    render(
      <AppProviders>
        <Probe />
      </AppProviders>,
    )

    expect(screen.getByTestId('child')).toHaveTextContent('child-content')
    expect(screen.getByTestId('query-mounted')).toHaveTextContent('true')
    expect(screen.getByTestId('router-mounted')).toHaveTextContent('true')
  })
})
