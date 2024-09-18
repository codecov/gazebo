// Make JSON.parse return unknown
import '@total-typescript/ts-reset/json-parse'

// Makes .filter(Boolean) filter out falsy values
import '@total-typescript/ts-reset/filter-boolean'

// Make .includes on as const arrays less strict
import '@total-typescript/ts-reset/array-includes'

// Make .indexOf on as const arrays less strict
import '@total-typescript/ts-reset/array-index-of'

// Make Set.has() less strict
import '@total-typescript/ts-reset/set-has'

// Make Map.has() less strict
import '@total-typescript/ts-reset/map-has'

// Removing any[] from Array.isArray()
import '@total-typescript/ts-reset/is-array'

declare module '*.png' {
  const value: any
  export = value
}

declare module '*.svg'
