import { createTable } from '@/lib/table/createTable'

export type HealthRow = {
  service: string
  status: 'ok' | 'degraded'
  responseTimeMs: number
}

const table = createTable<HealthRow>()

export const healthColumns = [
  table.accessor('service', {
    header: 'Service',
  }),
  table.accessor('status', {
    header: 'Status',
  }),
  table.accessor('responseTimeMs', {
    header: 'Response time (ms)',
  }),
]
