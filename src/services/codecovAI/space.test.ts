import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { SpaceTopic, CookingTopic, TechnologyTopic, _getRandomTopic } from './space'

describe('Topic classes', () => {
  describe('SpaceTopic', () => {
    it('has the correct id and name', () => {
      const topic = new SpaceTopic()
      
      expect(topic.id).toBe(1)
      expect(topic.name).toBe('Space')
    })

    it('returns a fact when getFact is called', () => {
      const topic = new SpaceTopic()
      const expectedFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      
      const fact = topic.getFact()
      
      expect(expectedFacts).toContain(fact)
    })
  })

  describe('CookingTopic', () => {
    it('has the correct id and name', () => {
      const topic = new CookingTopic()
      
      expect(topic.id).toBe(2)
      expect(topic.name).toBe('Cooking')
    })

    it('returns a fact when getFact is called', () => {
      const topic = new CookingTopic()
      const expectedFacts = [
        'Searing meat locks in its juices.',
        'A pinch of salt enhances sweet flavors.',
        'Baking requires precise measurements to succeed.',
      ]
      
      const fact = topic.getFact()
      
      expect(expectedFacts).toContain(fact)
    })
  })

  describe('TechnologyTopic', () => {
    it('has the correct id and name', () => {
      const topic = new TechnologyTopic()
      
      expect(topic.id).toBe(3)
      expect(topic.name).toBe('Technology')
    })

    it('returns a fact when getFact is called', () => {
      const topic = new TechnologyTopic()
      const expectedFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      
      const fact = topic.getFact()
      
      expect(expectedFacts).toContain(fact)
    })
  })
})

describe('_getRandomTopic', () => {
  let mathRandomSpy: vi.SpyInstance

  beforeEach(() => {
    mathRandomSpy = vi.spyOn(Math, 'random')
  })

  afterEach(() => {
    mathRandomSpy.mockRestore()
  })

  it('returns a SpaceTopic when random value is low', () => {
    mathRandomSpy.mockReturnValue(0)
    const topic = _getRandomTopic()
    expect(topic).toBeInstanceOf(SpaceTopic)
  })

  it('returns a CookingTopic when random value is in the middle', () => {
    mathRandomSpy.mockReturnValue(0.34)
    const topic = _getRandomTopic()
    expect(topic).toBeInstanceOf(CookingTopic)
  })

  it('returns a TechnologyTopic when random value is high', () => {
    mathRandomSpy.mockReturnValue(0.67)
    const topic = _getRandomTopic()
    expect(topic).toBeInstanceOf(TechnologyTopic)
  })
})