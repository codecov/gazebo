import { SpaceTopic, CookingTopic, TechnologyTopic, _getRandomTopic } from './space'

describe('Space Topics', () => {
  describe('SpaceTopic', () => {
    const topic = new SpaceTopic()

    it('has the correct id and name', () => {
      expect(topic.id).toBe(1)
      expect(topic.name).toBe('Space')
    })

    it('returns a valid fact', () => {
      const validFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      const fact = topic.getFact()
      expect(validFacts).toContain(fact)
    })

    it('can return different facts with multiple calls', () => {
      // Mock Math.random to return specific values
      const originalRandom = Math.random
      
      try {
        // Test first fact
        Math.random = jest.fn(() => 0)
        expect(topic.getFact()).toBe('The universe is expanding at an accelerating rate.')
        
        // Test second fact
        Math.random = jest.fn(() => 0.4)
        expect(topic.getFact()).toBe('Black holes can warp space and time.')
        
        // Test third fact
        Math.random = jest.fn(() => 0.8)
        expect(topic.getFact()).toBe('Stars are born in cosmic nurseries called nebulae.')
      } finally {
        Math.random = originalRandom
      }
    })
  })

  describe('CookingTopic', () => {
    const topic = new CookingTopic()

    it('has the correct id and name', () => {
      expect(topic.id).toBe(2)
      expect(topic.name).toBe('Cooking')
    })

    it('returns a valid fact', () => {
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

    it('returns a valid fact', () => {
      const validFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      const fact = topic.getFact()
      expect(validFacts).toContain(fact)
    })
  })

  describe('_getRandomTopic', () => {
    it('returns a valid Topic instance', () => {
      const topic = _getRandomTopic()
      expect(topic).toHaveProperty('id')
      expect(topic).toHaveProperty('name')
      expect(typeof topic.getFact).toBe('function')
    })

    it('can return different topics based on random value', () => {
      const originalRandom = Math.random
      
      try {
        Math.random = jest.fn(() => 0)
        expect(_getRandomTopic().name).toBe('Space')
        
        Math.random = jest.fn(() => 0.5)
        expect(_getRandomTopic().name).toBe('Cooking')
      } finally {
        Math.random = originalRandom
      }
    })
  })
})