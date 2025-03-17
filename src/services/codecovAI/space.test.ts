import { describe, expect, it, vi, beforeEach } from 'vitest'

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
})