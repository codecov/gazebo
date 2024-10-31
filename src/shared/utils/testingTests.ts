function generateFooOrBar(): string {
  const num = Math.floor(Math.random() * 100) + 1
  return num % 2 === 0 ? 'foo' : 'bar'
}

export function checkForConsecutiveMatches(): boolean {
  const firstResult = generateFooOrBar()
  const secondResult = generateFooOrBar()
  return firstResult === secondResult
}
