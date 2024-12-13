export type Framework = 'Jest' | 'Vitest' | 'Pytest' | 'Go'
export type FrameworkInstructions = {
  [key in Framework]: { install?: string; run?: string; workflow?: string }
}
