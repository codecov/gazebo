export type CoverageValue = 'H' | 'M' | 'P' | null | undefined

// copied from prism-react-renderer since they don't export it
export type Token = {
  types: string[]
  content: string
  empty?: boolean
}
