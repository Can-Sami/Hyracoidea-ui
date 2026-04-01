import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

import AppDevtools from './AppDevtools'

describe('AppDevtools', () => {
  it('does not crash when rendered outside router context', () => {
    const queryClient = new QueryClient()

    expect(() =>
      render(
        <QueryClientProvider client={queryClient}>
          <AppDevtools />
        </QueryClientProvider>,
      ),
    ).not.toThrow()
  })
})
