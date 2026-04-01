import { describe, expect, it } from 'vitest'

import { router } from './router'

describe('router smoke test', () => {
  it('creates a router instance', () => {
    expect(router).toBeDefined()
    expect(typeof router.navigate).toBe('function')
  })
})
