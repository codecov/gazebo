import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// Import the functions and classes we're testing
import { SpaceTopic, CookingTopic, TechnologyTopic, _getRandomTopic } from './space'

describe('Topic implementations', () => {
  describe('SpaceTopic', () => {
    it('has the correct id and name', () => {
      const topic = new SpaceTopic()
      expect(topic.id).toBe(1)
      expect(topic.name).toBe('Space')
    })

    it('returns a fact about space', () => {
      const topic = new SpaceTopic()
      const fact = topic.getFact()
      const possibleFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      expect(possibleFacts).toContain(fact)
    })

    it('returns each possible fact with controlled random values', () => {
      const topic = new SpaceTopic()
      const mathRandomSpy = vi.spyOn(Math, 'random')
      
      // First fact (0/3)
      mathRandomSpy.mockReturnValueOnce(0)
      expect(topic.getFact()).toBe('The universe is expanding at an accelerating rate.')
      
      // Second fact (1/3)
      mathRandomSpy.mockReturnValueOnce(0.34)
      expect(topic.getFact()).toBe('Black holes can warp space and time.')
      
      // Third fact (2/3)
      mathRandomSpy.mockReturnValueOnce(0.67)
      expect(topic.getFact()).toBe('Stars are born in cosmic nurseries called nebulae.')
    })
  })

  describe('CookingTopic', () => {
    it('has the correct id and name', () => {
      const topic = new CookingTopic()
      expect(topic.id).toBe(2)
      expect(topic.name).toBe('Cooking')
    })

    it('returns a fact about cooking', () => {
      const topic = new CookingTopic()
      const fact = topic.getFact()
      const possibleFacts = [
        'Searing meat locks in its juices.',
        'A pinch of salt enhances sweet flavors.',
        'Baking requires precise measurements to succeed.',
      ]
      expect(possibleFacts).toContain(fact)
    })

    it('returns each possible fact with controlled random values', () => {
      const topic = new CookingTopic()
      const mathRandomSpy = vi.spyOn(Math, 'random')
      
      // First fact (0/3)
      mathRandomSpy.mockReturnValueOnce(0)
      expect(topic.getFact()).toBe('Searing meat locks in its juices.')
      
      // Second fact (1/3)
      mathRandomSpy.mockReturnValueOnce(0.34)
      expect(topic.getFact()).toBe('A pinch of salt enhances sweet flavors.')
      
      // Third fact (2/3)
      mathRandomSpy.mockReturnValueOnce(0.67)
      expect(topic.getFact()).toBe('Baking requires precise measurements to succeed.')
    })
  })

  describe('TechnologyTopic', () => {
    it('has the correct id and name', () => {
      const topic = new TechnologyTopic()
      expect(topic.id).toBe(3)
      expect(topic.name).toBe('Technology')
    })

    it('returns a fact about technology', () => {
      const topic = new TechnologyTopic()
      const fact = topic.getFact()
      const possibleFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      expect(possibleFacts).toContain(fact)
    })

    it('returns each possible fact with controlled random values', () => {
      const topic = new TechnologyTopic()
      const mathRandomSpy = vi.spyOn(Math, 'random')
      
      // First fact (0/3)
      mathRandomSpy.mockReturnValueOnce(0)
      expect(topic.getFact()).toBe("Moore's law predicts the doubling of transistors every couple of years.")
      
      // Second fact (1/3)
      mathRandomSpy.mockReturnValueOnce(0.34)
      expect(topic.getFact()).toBe('Artificial intelligence is transforming numerous industries.')
      
      // Third fact (2/3)
      mathRandomSpy.mockReturnValueOnce(0.67)
      expect(topic.getFact()).toBe('Quantum computing promises to revolutionize cryptography.')
    })
  })
})

describe('_getRandomTopic', () => {
  it('returns a valid Topic instance', () => {
    const topic = _getRandomTopic()
    expect(topic).toHaveProperty('id')
    expect(topic).toHaveProperty('name')
    expect(typeof topic.getFact).toBe('function')
    
    const possibleTopics = [SpaceTopic, CookingTopic, TechnologyTopic]
    const isValidTopicInstance = possibleTopics.some(TopicClass => topic instanceof TopicClass)
    expect(isValidTopicInstance).toBe(true)
  })

  it('uses Math.random to select a topic', () => {
    const randomSpy = vi.spyOn(Math, 'floor')
    
    // Mock to return first topic (SpaceTopic)
    randomSpy.mockReturnValueOnce(0)
    let topic = _getRandomTopic()
    expect(topic instanceof SpaceTopic).toBe(true)
    
    // Mock to return second topic (CookingTopic)
    randomSpy.mockReturnValueOnce(1)
    topic = _getRandomTopic()
    expect(topic instanceof CookingTopic).toBe(true)
    
    // Mock to return third topic (TechnologyTopic)
    randomSpy.mockReturnValueOnce(2)
    topic = _getRandomTopic()
    expect(topic instanceof TechnologyTopic).toBe(true)
    
    // Verify Math.random was called the expected number of times
    expect(randomSpy).toHaveBeenCalledTimes(3)
    
    randomSpy.mockRestore()
  })

})
    const mathRandomSpy = vi.spyOn(Math, 'random')
    
    // First topic (0/3)
    mathRandomSpy.mockReturnValueOnce(0)
    expect(_getRandomTopic()).toBeInstanceOf(SpaceTopic)
    
    // Second topic (1/3)
    mathRandomSpy.mockReturnValueOnce(0.34)
    expect(_getRandomTopic()).toBeInstanceOf(CookingTopic)
    
    // Third topic (2/3)
    mathRandomSpy.mockReturnValueOnce(0.67)
    expect(_getRandomTopic()).toBeInstanceOf(TechnologyTopic)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})