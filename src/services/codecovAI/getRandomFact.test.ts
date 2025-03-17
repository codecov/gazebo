import { describe, it, expect, vi } from 'vitest'

import { getRandomTopic, SpaceTopic, CookingTopic, TechnologyTopic } from './space'

// Create a wrapper function to test the random fact generation
function getRandomFact(): string {
  const topic = getRandomTopic()
  return topic.getFact()
}

describe('getRandomFact', () => {
  it('returns a fact string', () => {
    const fact = getRandomFact()
    expect(typeof fact).toBe('string')
    expect(fact.length).toBeGreaterThan(0)
  })

  it('returns facts from different topics based on random selection', () => {
    // Mock Math.random for getRandomTopic to return specific topics
    vi.spyOn(Math, 'random').mockReturnValueOnce(0) // Should return SpaceTopic
    const spaceFact = getRandomFact()
    
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.4) // Should return CookingTopic
    const cookingFact = getRandomFact()
    
    // Verify we got different facts from different topics
    expect(spaceFact).not.toEqual(cookingFact)
  })
})