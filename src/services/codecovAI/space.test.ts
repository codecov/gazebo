import { SpaceTopic, CookingTopic, TechnologyTopic, _getRandomTopic } from './space'

describe('Topic Implementations', () => {
  describe('SpaceTopic', () => {
    let spaceTopic: SpaceTopic

    beforeEach(() => {
      spaceTopic = new SpaceTopic()
    })

    it('has the correct id', () => {
      expect(spaceTopic.id).toBe(1)
    })

    it('has the correct name', () => {
      expect(spaceTopic.name).toBe('Space')
    })

    it('returns a fact from available facts', () => {
      const possibleFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      const fact = spaceTopic.getFact()
      expect(possibleFacts).toContain(fact)
    })

    it('returns different facts based on randomness', () => {
      // Mock Math.random to return specific values
      const originalRandom = Math.random
      
      try {
        // Test each possible outcome
        const facts: string[] = []
        
        // Force return of first fact
        Math.random = vi.fn().mockReturnValueOnce(0)
        facts.push(spaceTopic.getFact())
        
        // Force return of second fact
        Math.random = vi.fn().mockReturnValueOnce(0.34)
        facts.push(spaceTopic.getFact())
        
        // Force return of third fact
        Math.random = vi.fn().mockReturnValueOnce(0.67)
        facts.push(spaceTopic.getFact())
        
        // Check that we got all three different facts
        expect(facts).toHaveLength(3)
        expect(new Set(facts).size).toBe(3)
      } finally {
        Math.random = originalRandom
      }
    })
  })

  describe('CookingTopic', () => {
    let cookingTopic: CookingTopic

    beforeEach(() => {
      cookingTopic = new CookingTopic()
    })

    it('has the correct id', () => {
      expect(cookingTopic.id).toBe(2)
    })

    it('has the correct name', () => {
      expect(cookingTopic.name).toBe('Cooking')
    })

    it('returns a fact from available facts', () => {
      const possibleFacts = [
        'Searing meat locks in its juices.',
        'A pinch of salt enhances sweet flavors.',
        'Baking requires precise measurements to succeed.',
      ]
      const fact = cookingTopic.getFact()
      expect(possibleFacts).toContain(fact)
    })
  })

  describe('TechnologyTopic', () => {
    let technologyTopic: TechnologyTopic

    beforeEach(() => {
      technologyTopic = new TechnologyTopic()
    })

    it('has the correct id', () => {
      expect(technologyTopic.id).toBe(3)
    })

    it('has the correct name', () => {
      expect(technologyTopic.name).toBe('Technology')
    })

    it('returns a fact from available facts', () => {
      const possibleFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      const fact = technologyTopic.getFact()
      expect(possibleFacts).toContain(fact)
    })
  })

  describe('_getRandomTopic', () => {
    it('returns one of the three topic implementations', () => {
      // Run the function multiple times to ensure we cover all possible outcomes
      const topicIds = new Set<number>()
      for (let i = 0; i < 100; i++) {
        const topic = _getRandomTopic()
        topicIds.add(topic.id)
      }
      
      // Verify we got all three possible topics (with high probability)
      expect(topicIds.size).toBe(3)
    })
  })
})