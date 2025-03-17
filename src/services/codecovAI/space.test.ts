import { SpaceTopic, CookingTopic, TechnologyTopic, _getRandomTopic } from './space'

describe('Topic implementations', () => {
  describe('SpaceTopic', () => {
    const topic = new SpaceTopic()

    it('has the correct id and name', () => {
      expect(topic.id).toBe(1)
      expect(topic.name).toBe('Space')
    })

    it('returns a fact about space', () => {
      const validFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      
      const fact = topic.getFact()
      expect(validFacts).toContain(fact)
    })
  })

  describe('CookingTopic', () => {
    const topic = new CookingTopic()

    it('has the correct id and name', () => {
      expect(topic.id).toBe(2)
      expect(topic.name).toBe('Cooking')
    })

    it('returns a fact about cooking', () => {
      const validFacts = [
        'Searing meat locks in its juices.',
        'A pinch of salt enhances sweet flavors.',
        'Baking requires precise measurements to succeed.',
      ]
      
      const fact = topic.getFact()
      expect(validFacts).toContain(fact)
    })
  })

  describe('TechnologyTopic', () => {
    const topic = new TechnologyTopic()

    it('has the correct id and name', () => {
      expect(topic.id).toBe(3)
      expect(topic.name).toBe('Technology')
    })

    it('returns a fact about technology', () => {
      const validFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      
      const fact = topic.getFact()
      expect(validFacts).toContain(fact)
    })
  })
})

describe('_getRandomTopic', () => {
  it('returns a valid Topic instance', () => {
    const topic = _getRandomTopic()
    
    expect(topic).toBeDefined()
    expect(topic.id).toBeGreaterThan(0)
    expect(typeof topic.name).toBe('string')
    expect(topic.name.length).toBeGreaterThan(0)
    
    const fact = topic.getFact()
    expect(typeof fact).toBe('string')
  })
})