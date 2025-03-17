import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// Import the module with proper exports
import {
  Topic,
  SpaceTopic,
  CookingTopic,
  TechnologyTopic,
  _getRandomTopic
} from './space'

describe('Topic classes', () => {
  describe('SpaceTopic', () => {
    let topic: SpaceTopic

    beforeEach(() => {
      topic = new SpaceTopic()
    })

    it('has the correct id and name', () => {
      expect(topic.id).toBe(1)
      expect(topic.name).toBe('Space')
    })

    it('returns a fact when getFact is called', () => {
      const expectedFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      
      const fact = topic.getFact()
      
      expect(expectedFacts).toContain(fact)
    })

    it('returns different facts when called multiple times with different random values', () => {
      const mathRandomSpy = vi.spyOn(Math, 'random')
      
      mathRandomSpy.mockReturnValueOnce(0)
      const fact1 = topic.getFact()
      
      mathRandomSpy.mockReturnValueOnce(0.5)
      const fact2 = topic.getFact()
      
      mathRandomSpy.mockReturnValueOnce(0.9)
      const fact3 = topic.getFact()
      
      expect(fact1).toBe('The universe is expanding at an accelerating rate.')
      expect(fact2).toBe('Black holes can warp space and time.')
      expect(fact3).toBe('Stars are born in cosmic nurseries called nebulae.')
      
      mathRandomSpy.mockRestore()
    })
  })

  describe('CookingTopic', () => {
    let topic: CookingTopic

    beforeEach(() => {
      topic = new CookingTopic()
    })

    it('has the correct id and name', () => {
      expect(topic.id).toBe(2)
      expect(topic.name).toBe('Cooking')
    })

    it('returns a fact when getFact is called', () => {
      const expectedFacts = [
        'Searing meat locks in its juices.',
        'A pinch of salt enhances sweet flavors.',
        'Baking requires precise measurements to succeed.',
      ]
      
      const fact = topic.getFact()
      
      expect(expectedFacts).toContain(fact)
    })

    it('returns different facts when called multiple times with different random values', () => {
      const mathRandomSpy = vi.spyOn(Math, 'random')
      
      mathRandomSpy.mockReturnValueOnce(0)
      const fact1 = topic.getFact()
      
      mathRandomSpy.mockReturnValueOnce(0.5)
      const fact2 = topic.getFact()
      
      mathRandomSpy.mockReturnValueOnce(0.9)
      const fact3 = topic.getFact()
      
      expect(fact1).toBe('Searing meat locks in its juices.')
      expect(fact2).toBe('A pinch of salt enhances sweet flavors.')
      expect(fact3).toBe('Baking requires precise measurements to succeed.')
      
      mathRandomSpy.mockRestore()
    })
  })

  describe('TechnologyTopic', () => {
    let topic: TechnologyTopic

    beforeEach(() => {
      topic = new TechnologyTopic()
    })

    it('has the correct id and name', () => {
      expect(topic.id).toBe(3)
      expect(topic.name).toBe('Technology')
    })

    it('returns a fact when getFact is called', () => {
      const expectedFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      
      const fact = topic.getFact()
      
      expect(expectedFacts).toContain(fact)
    })

    it('returns different facts when called multiple times with different random values', () => {
      const mathRandomSpy = vi.spyOn(Math, 'random')
      
      mathRandomSpy.mockReturnValueOnce(0)
      const fact1 = topic.getFact()
      
      mathRandomSpy.mockReturnValueOnce(0.5)
      const fact2 = topic.getFact()
      
      mathRandomSpy.mockReturnValueOnce(0.9)
      const fact3 = topic.getFact()
      
      expect(fact1).toBe("Moore's law predicts the doubling of transistors every couple of years.")
      expect(fact2).toBe('Artificial intelligence is transforming numerous industries.')
      expect(fact3).toBe('Quantum computing promises to revolutionize cryptography.')
      
      mathRandomSpy.mockRestore()
    })
  })
})

describe('_getRandomTopic', () => {
  it('returns a Topic instance', () => {
    const topic = _getRandomTopic()
    // Verify it implements the Topic interface
    expect(topic).toHaveProperty('id')
    expect(topic).toHaveProperty('name')
    expect(typeof topic.getFact).toBe('function')
  })

  it('can return any of the three topic types', () => {
    const mathRandomSpy = vi.spyOn(Math, 'random')
    
    // Test SpaceTopic (first item in array)
    mathRandomSpy.mockReturnValueOnce(0)
    let topic = _getRandomTopic()
    expect(topic).toBeInstanceOf(SpaceTopic)
    
    // Test CookingTopic (second item in array)
    mathRandomSpy.mockReturnValueOnce(0.34)
    topic = _getRandomTopic()
    expect(topic).toBeInstanceOf(CookingTopic)
    
    // Test TechnologyTopic (third item in array)
    mathRandomSpy.mockReturnValueOnce(0.67)
    topic = _getRandomTopic()
    expect(topic).toBeInstanceOf(TechnologyTopic)
    
    // Test edge case - high value should still give the last item
    mathRandomSpy.mockReturnValueOnce(0.99)
    topic = _getRandomTopic()
    expect(topic).toBeInstanceOf(TechnologyTopic)
    
    mathRandomSpy.mockRestore()
  })
})