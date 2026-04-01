import { describe, expect, it } from 'vitest'

import { createTable } from './createTable'

type HealthRow = {
  service: string
  status: 'ok' | 'degraded'
  responseTimeMs: number
}

describe('createTable', () => {
  it('produces typed column definitions', () => {
    const table = createTable<HealthRow>()
    const columns = [
      table.accessor('service', { header: 'Service' }),
      table.accessor('status', { header: 'Status' }),
      table.accessor('responseTimeMs', {
        header: 'Response time (ms)',
        cell: (info) => info.getValue().toFixed(0),
      }),
    ]

    // @ts-expect-error invalid accessor key must be rejected
    table.accessor('missingField', { header: 'Missing' })

    expect(columns).toHaveLength(3)
  })
})
