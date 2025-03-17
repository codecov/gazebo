import {
  SpaceTopic,
  CookingTopic,
  TechnologyTopic,
  _getRandomTopic,
} from './space'

describe('SpaceTopic', () => {
  it('should return a fact about space', () => {
    const spaceTopic = new SpaceTopic()
    const fact = spaceTopic.getFact()
    expect(typeof fact).toBe('string')
    expect(fact.length).toBeGreaterThan(0)
  })
})

describe('CookingTopic', () => {
  it('should return a fact about cooking', () => {
    const cookingTopic = new CookingTopic()
    const fact = cookingTopic.getFact()
    expect(typeof fact).toBe('string')
    expect(fact.length).toBeGreaterThan(0)
  })
})

describe('TechnologyTopic', () => {
  it('should return a fact about technology', () => {
    const technologyTopic = new TechnologyTopic()
    const fact = technologyTopic.getFact()
    expect(typeof fact).toBe('string')
    expect(fact.length).toBeGreaterThan(0)
  })
})

describe('_getRandomTopic', () => {
  it('should return one of the topic objects', () => {
    const topic = _getRandomTopic()
    expect(topic).toBeDefined()
    expect(topic).toHaveProperty('getFact')
    const fact = topic.getFact()
    expect(typeof fact).toBe('string')
    expect(fact.length).toBeGreaterThan(0)
  })
})

