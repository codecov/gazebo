import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// Import from space module
import * as SpaceModule from './space'

describe('Topic interface implementation', () => {
  describe('SpaceTopic', () => {
    it('has the correct id and name', () => {
      const topic = new SpaceModule.SpaceTopic()
      
      expect(topic.id).toBe(1)
      expect(topic.name).toBe('Space')
    })

    it('returns a fact when getFact is called', () => {
      const topic = new SpaceModule.SpaceTopic()
      const expectedFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      
      const fact = topic.getFact()
      
      expect(expectedFacts).toContain(fact)
    })

    it('uses Math.random to select a random fact', () => {
      const randomSpy = vi.spyOn(Math, 'random')
      randomSpy.mockReturnValue(0.5)
      
      const topic = new SpaceModule.SpaceTopic()
      topic.getFact()
      
      expect(randomSpy).toHaveBeenCalled()
      randomSpy.mockRestore()
    })
    
    it('selects facts based on the random value', () => {
      const topic = new SpaceModule.SpaceTopic()
      const randomSpy = vi.spyOn(Math, 'random')
      
      // Test first fact
      randomSpy.mockReturnValue(0)
      expect(topic.getFact()).toBe('The universe is expanding at an accelerating rate.')
      
      // Test second fact
      randomSpy.mockReturnValue(0.34)
      expect(topic.getFact()).toBe('Black holes can warp space and time.')
      
      // Test third fact
      randomSpy.mockReturnValue(0.67)
      expect(topic.getFact()).toBe('Stars are born in cosmic nurseries called nebulae.')
      
      randomSpy.mockRestore()
    })
  })

  describe('CookingTopic', () => {
    it('has the correct id and name', () => {
      const topic = new SpaceModule.CookingTopic()
      
      expect(topic.id).toBe(2)
      expect(topic.name).toBe('Cooking')
    })

    it('returns a fact when getFact is called', () => {
      const topic = new SpaceModule.CookingTopic()
      const expectedFacts = [
        'Searing meat locks in its juices.',
        'A pinch of salt enhances sweet flavors.',
        'Baking requires precise measurements to succeed.',
      ]
      
      const fact = topic.getFact()
      
      expect(expectedFacts).toContain(fact)
    })
    
    it('selects facts based on the random value', () => {
      const topic = new SpaceModule.CookingTopic()
      const randomSpy = vi.spyOn(Math, 'random')
      
      randomSpy.mockReturnValue(0)
      expect(topic.getFact()).toBe('Searing meat locks in its juices.')
      
      randomSpy.mockReturnValue(0.34)
      expect(topic.getFact()).toBe('A pinch of salt enhances sweet flavors.')
      
      randomSpy.mockReturnValue(0.67)
      expect(topic.getFact()).toBe('Baking requires precise measurements to succeed.')
      
      randomSpy.mockRestore()
    })
  })

  describe('TechnologyTopic', () => {
    it('has the correct id and name', () => {
      const topic = new SpaceModule.TechnologyTopic()
      
      expect(topic.id).toBe(3)
      expect(topic.name).toBe('Technology')
    })

    it('returns a fact when getFact is called', () => {
      const topic = new SpaceModule.TechnologyTopic()
      const expectedFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      
      const fact = topic.getFact()
      
      expect(expectedFacts).toContain(fact)
    })
    
    it('selects facts based on the random value', () => {
      const topic = new SpaceModule.TechnologyTopic()
      const randomSpy = vi.spyOn(Math, 'random')
      
      randomSpy.mockReturnValue(0)
      expect(topic.getFact()).toBe("Moore's law predicts the doubling of transistors every couple of years.")
      
      randomSpy.mockReturnValue(0.34)
      expect(topic.getFact()).toBe('Artificial intelligence is transforming numerous industries.')
      
      randomSpy.mockReturnValue(0.67)
      expect(topic.getFact()).toBe('Quantum computing promises to revolutionize cryptography.')
      
      randomSpy.mockRestore()
    })
  })
})

describe('_getRandomTopic', () => {
  it('returns a valid Topic instance', () => {
    const topic = SpaceModule._getRandomTopic()
    expect(topic).toHaveProperty('id')
    expect(topic).toHaveProperty('name')
    expect(typeof topic.getFact).toBe('function')
  })

  it('uses Math.random to select a random topic', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    SpaceModule._getRandomTopic()
    expect(randomSpy).toHaveBeenCalled()
    randomSpy.mockRestore()
  })

  it('returns different topic types based on random values', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    
    randomSpy.mockReturnValue(0)
    expect(SpaceModule._getRandomTopic()).toBeInstanceOf(SpaceModule.SpaceTopic)
    
    randomSpy.mockReturnValue(0.34)
    expect(SpaceModule._getRandomTopic()).toBeInstanceOf(SpaceModule.CookingTopic)
    
    randomSpy.mockReturnValue(0.67)
    expect(SpaceModule._getRandomTopic()).toBeInstanceOf(SpaceModule.TechnologyTopic)
    
    randomSpy.mockRestore()
  })
})