import { describe, it, expect } from 'vitest'

import { Topic, SpaceTopic, CookingTopic, TechnologyTopic } from './space'

describe('Topic interface implementation', () => {
  it('ensures all Topic implementations have unique IDs', () => {
    const spaceTopic = new SpaceTopic()
    const cookingTopic = new CookingTopic()
    const technologyTopic = new TechnologyTopic()
    
    // Check that each topic has a unique ID
    expect(spaceTopic.id).not.toEqual(cookingTopic.id)
    expect(spaceTopic.id).not.toEqual(technologyTopic.id)
    expect(cookingTopic.id).not.toEqual(technologyTopic.id)
  })
  
  it('ensures all Topic implementations return valid facts', () => {
    const topics: Topic[] = [
      new SpaceTopic(),
      new CookingTopic(),
      new TechnologyTopic()
    ]
    
    topics.forEach(topic => {
      expect(topic.getFact().length).toBeGreaterThan(10) // Facts should be reasonably long
    })
  })
})