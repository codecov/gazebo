import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as SpaceModule from './space'

describe('Topic implementations', () => {
  describe('SpaceTopic', () => {
    it('has the correct id and name', () => {
      const topic = new SpaceModule.SpaceTopic()
      
      expect(topic.id).toBe(1)
      expect(topic.name).toBe('Space')
    })
    
    it('returns a valid space fact', () => {
      const topic = new SpaceModule.SpaceTopic()
      const fact = topic.getFact()
      
      const expectedFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      
      expect(expectedFacts).toContain(fact)
    })
  })
  
  describe('CookingTopic', () => {
    it('has the correct id and name', () => {
      const topic = new SpaceModule.CookingTopic()
      
      expect(topic.id).toBe(2)
      expect(topic.name).toBe('Cooking')
    })
    
    it('returns a valid cooking fact', () => {
      const topic = new SpaceModule.CookingTopic()
      const fact = topic.getFact()
      
      const expectedFacts = [
        'Searing meat locks in its juices.',
        'A pinch of salt enhances sweet flavors.',
        'Baking requires precise measurements to succeed.',
      ]
      
      expect(expectedFacts).toContain(fact)
    })
  })
  
  describe('TechnologyTopic', () => {
    it('has the correct id and name', () => {
      const topic = new SpaceModule.TechnologyTopic()
      
      expect(topic.id).toBe(3)
      expect(topic.name).toBe('Technology')
    })
    
    it('returns a valid technology fact', () => {
      const topic = new SpaceModule.TechnologyTopic()
      const fact = topic.getFact()
      
      const expectedFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      
      expect(expectedFacts).toContain(fact)
    })
  })
})