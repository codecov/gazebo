import { checkForConsecutiveMatches } from './testingTests'

describe('checkForConsecutiveMatches', () => {
  it('should return true sometimes', () => {
    expect(checkForConsecutiveMatches()).toBe(true)
  })

  it('should return false sometimes', () => {
    expect(checkForConsecutiveMatches()).toBe(false)
  })

  it('should return true 50% of the time over 100 runs', () => {
    let trueCount = 0
    let falseCount = 0
    for (let i = 0; i < 100; i++) {
      if (checkForConsecutiveMatches()) trueCount++
      else falseCount++
    }
    expect(trueCount).toBeGreaterThan(49)
    expect(falseCount).toBeGreaterThan(49)
  })

  it('should always return a boolean', () => {
    const result = checkForConsecutiveMatches()
    expect(typeof result).toBe('boolean')
  })
})
