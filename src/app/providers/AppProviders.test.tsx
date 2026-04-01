import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { AppProviders } from './AppProviders'

describe('AppProviders', () => {
  it('mounts the app with router-rendered content', async () => {
    render(<AppProviders />)

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument()
  })
})
