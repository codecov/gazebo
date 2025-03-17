import * as spaceModule from './space'

// Access the internal functions using the testing pattern
// Using bracket notation to access non-exported functions
const getRandomTopic = spaceModule['_getRandomTopic']

describe('Topic Implementations', () => {
  // Mock Math.random to return predictable values for testing
  let originalMathRandom: () => number

  beforeEach(() => {
    originalMathRandom = Math.random
  })

  afterEach(() => {
    Math.random = originalMathRandom
  })

  describe('Space Topic', () => {
    it('has the correct id and name', () => {
      // Force Math.random to return 0, which will select the first topic (Space)
      Math.random = () => 0
      const topic = getRandomTopic()
      
      expect(topic.id).toBe(1)
      expect(topic.name).toBe('Space')
    })

    it('returns a fact from available facts', () => {
      // Force Math.random to return 0 for topic selection
      Math.random = () => 0
      const topic = getRandomTopic()
      
      const possibleFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      
      // Reset Math.random to allow random fact selection
      Math.random = originalMathRandom
      const fact = topic.getFact()
      expect(possibleFacts).toContain(fact)
    })
    it('distributes facts randomly', () => {
      // Force Math.random to return 0 for topic selection
      Math.random = () => 0
      const topic = getRandomTopic()
      
      // Mock to cycle through different values for fact selection
      let counter = 0
      Math.random = () => [0, 0.4, 0.8][counter++ % 3]
      
      const facts = new Set()
      for (let i = 0; i < 3; i++) {
        facts.add(topic.getFact())
      }
      
      // Should get 3 unique facts
      expect(facts.size).toBe(3)
    })
  })

  describe('Cooking Topic', () => {
    it('has the correct id and name', () => {
      // Force Math.random to return 0.4, which will select the second topic (Cooking)
      Math.random = () => 0.4
      const topic = getRandomTopic()
      
      expect(topic.id).toBe(2)
      expect(topic.name).toBe('Cooking')
    })

    it('returns a fact from available facts', () => {
      // Force Math.random to return 0.4 for topic selection
      Math.random = () => 0.4
      const topic = getRandomTopic()
      
      const possibleFacts = [
        'Searing meat locks in its juices.',
        'A pinch of salt enhances sweet flavors.',
        'Baking requires precise measurements to succeed.',
      ]
      
      // Reset Math.random to allow random fact selection
      Math.random = originalMathRandom
      const fact = topic.getFact()
      expect(possibleFacts).toContain(fact)
    })
  })

  describe('Technology Topic', () => {
    it('has the correct id and name', () => {
      // Force Math.random to return 0.8, which will select the third topic (Technology)
      Math.random = () => 0.8
      const topic = getRandomTopic()
      
      expect(topic.id).toBe(3)
      expect(topic.name).toBe('Technology')
    })

    it('returns a fact from available facts', () => {
      // Force Math.random to return 0.8 for topic selection
      Math.random = () => 0.8
      const topic = getRandomTopic()
      
      const possibleFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      
      // Reset Math.random to allow random fact selection
      Math.random = originalMathRandom
      const fact = topic.getFact()
      expect(possibleFacts).toContain(fact)
    })
  })

  describe('_getRandomTopic function', () => {
    it('returns a valid Topic implementation', () => {
      const topic = getRandomTopic()
      expect(topic).toHaveProperty('id')
      expect(topic).toHaveProperty('name')
      expect(typeof topic.getFact).toBe('function')
      expect(typeof topic.getFact()).toBe('string')
    })
    
    it('returns different topics based on randomness', () => {
      // Mock to cycle through different values
      let counter = 0
      Math.random = () => [0, 0.4, 0.8][counter++ % 3]
      
      const topicNames = new Set()
      for (let i = 0; i < 3; i++) {
        topicNames.add(getRandomTopic().name)
      }
      
      // Should get 3 unique topic names
      expect(topicNames.size).toBe(3)
      expect(topicNames.has('Space')).toBe(true)
      expect(topicNames.has('Cooking')).toBe(true)
      expect(topicNames.has('Technology')).toBe(true)
    })
  })
})
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