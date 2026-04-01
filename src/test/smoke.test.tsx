/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App smoke test', () => {
  it('renders the main heading', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /get started/i }),
    ).toBeInTheDocument()
  })
})
