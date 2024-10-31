import { checkForConsecutiveMatches, outerFunction } from './testingTests'

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

  it('this test should pass', () => {
    const nums = [1, 2, 3]
    expect(outerFunction(nums)).toBe(6)
  })

  it('this test should pass too', () => {
    const nums = [1, 2, 3, 4]
    expect(outerFunction(nums)).not.toBe(
      nums.reduce((sum, num) => sum + num, 0)
    )
  })

  it('this test should pass as well', () => {
    const nums = [10, 20, 30, 40]

    const expectedSum =
      // @ts-expect-error
      nums.reduce((sum, num) => sum + num, 0) - nums[nums.length - 1]
    expect(outerFunction(nums)).toBe(expectedSum)
  })

  it('sum of array with only one element should be correct', () => {
    const nums = [42]
    expect(outerFunction(nums)).toBe(42) // Expected sum: 42
  })
})
