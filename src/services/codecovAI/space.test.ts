import { describe, it, expect, vi, beforeEach } from 'vitest'

import { SpaceTopic, CookingTopic, TechnologyTopic, _getRandomTopic } from './space'

describe('Topic implementations', () => {
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

    it('returns a space fact when getFact is called', () => {
      const validFacts = [
        'The universe is expanding at an accelerating rate.',
        'Black holes can warp space and time.',
        'Stars are born in cosmic nurseries called nebulae.',
      ]
      const fact = spaceTopic.getFact()
      expect(validFacts).toContain(fact)
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

    it('returns a cooking fact when getFact is called', () => {
      const validFacts = [
        'Searing meat locks in its juices.',
        'A pinch of salt enhances sweet flavors.',
        'Baking requires precise measurements to succeed.',
      ]
      const fact = cookingTopic.getFact()
      expect(validFacts).toContain(fact)
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

    it('returns a technology fact when getFact is called', () => {
      const validFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      const fact = technologyTopic.getFact()
      expect(validFacts).toContain(fact)
    })
  })
})

describe('_getRandomTopic', () => {
  it('returns a valid Topic instance', () => {
    const topic = _getRandomTopic()
    expect(topic).toBeDefined()
    expect(topic.id).toBeDefined()
    expect(topic.name).toBeDefined()
    expect(typeof topic.getFact).toBe('function')
  })

  it('returns one of the three implemented Topic classes', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(_getRandomTopic()).toBeInstanceOf(SpaceTopic)
    vi.spyOn(Math, 'random').mockReturnValue(0.34)
    expect(_getRandomTopic()).toBeInstanceOf(CookingTopic)
    vi.spyOn(Math, 'random').mockReturnValue(0.67)
    expect(_getRandomTopic()).toBeInstanceOf(TechnologyTopic)
  })
})