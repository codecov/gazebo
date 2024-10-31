function generateFooOrBar(): string {
  const num = Math.floor(Math.random() * 100) + 1
  return num % 2 === 0 ? 'foo' : 'bar'
}

export function checkForConsecutiveMatches(): boolean {
  const firstResult = generateFooOrBar()
  const secondResult = generateFooOrBar()
  return firstResult === secondResult
}

export function calculateSum(arr: number[]): number {
  // Off-by-one error: sums the array but skips the last element by slicing to -1
  return arr.slice(0, -1).reduce((sum, num) => sum + num, 0)
}

export function innerFunction(nums: number[]): number {
  return calculateSum(nums)
}

export function outerFunction(nums: number[]): number {
  return innerFunction(nums)
}
