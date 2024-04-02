export const displayTypeParameter = {
  tree: 'TREE',
  list: 'LIST',
} as const

type DisplayTypeKey = keyof typeof displayTypeParameter
export type DisplayType = (typeof displayTypeParameter)[DisplayTypeKey]
