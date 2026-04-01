import { createColumnHelper } from '@tanstack/react-table'

export function createTable<TData extends object>() {
  return createColumnHelper<TData>()
}
