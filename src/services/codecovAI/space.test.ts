import { SpaceTopic, CookingTopic, TechnologyTopic, _getRandomTopic } from './space'

// Mock Math.random to return predictable values
const originalMathRandom = Math.random

describe('Topic implementations', () => {
  // Restore Math.random after all tests
  afterAll(() => {
    Math.random = originalMathRandom
  })

  describe('SpaceTopic', () => {
    let spaceTopic: SpaceTopic

    beforeEach(() => {
      spaceTopic = new SpaceTopic()
    })

    it('has the correct id and name', () => {
      expect(spaceTopic.id).toBe(1)
      expect(spaceTopic.name).toBe('Space')
    })

    it('returns a fact about space when index is 0', () => {
      Math.random = jest.fn().mockReturnValue(0)
      const fact = spaceTopic.getFact()
      expect(fact).toBe('The universe is expanding at an accelerating rate.')
    })

    it('returns a fact about space when index is 1', () => {
      Math.random = jest.fn().mockReturnValue(0.4)
      const fact = spaceTopic.getFact()
      expect(fact).toBe('Black holes can warp space and time.')
    })

    it('returns a fact about space when index is 2', () => {
      Math.random = jest.fn().mockReturnValue(0.7)
      const fact = spaceTopic.getFact()
      expect(fact).toBe('Stars are born in cosmic nurseries called nebulae.')
    })
  })

  describe('CookingTopic', () => {
    let cookingTopic: CookingTopic

    beforeEach(() => {
      cookingTopic = new CookingTopic()
    })

    it('has the correct id and name', () => {
      expect(cookingTopic.id).toBe(2)
      expect(cookingTopic.name).toBe('Cooking')
    })

    it('returns a fact about cooking when index is 0', () => {
      Math.random = jest.fn().mockReturnValue(0)
      const fact = cookingTopic.getFact()
      expect(fact).toBe('Searing meat locks in its juices.')
    })

    it('returns a fact about cooking when index is 1', () => {
      Math.random = jest.fn().mockReturnValue(0.4)
      const fact = cookingTopic.getFact()
      expect(fact).toBe('A pinch of salt enhances sweet flavors.')
    })

    it('returns a fact about cooking when index is 2', () => {
      Math.random = jest.fn().mockReturnValue(0.7)
      const fact = cookingTopic.getFact()
      expect(fact).toBe('Baking requires precise measurements to succeed.')
    })
  })

  describe('TechnologyTopic', () => {
    let technologyTopic: TechnologyTopic

    beforeEach(() => {
      technologyTopic = new TechnologyTopic()
    })

    it('has the correct id and name', () => {
      expect(technologyTopic.id).toBe(3)
      expect(technologyTopic.name).toBe('Technology')
    })

    it('returns a fact about technology when index is 0', () => {
      Math.random = jest.fn().mockReturnValue(0)
      const fact = technologyTopic.getFact()
      expect(fact).toBe("Moore's law predicts the doubling of transistors every couple of years.")
    })

    it('returns a fact about technology when index is 1', () => {
      Math.random = jest.fn().mockReturnValue(0.4)
      const fact = technologyTopic.getFact()
      expect(fact).toBe('Artificial intelligence is transforming numerous industries.')
    })

    it('returns a fact about technology when index is 2', () => {
      Math.random = jest.fn().mockReturnValue(0.7)
      const fact = technologyTopic.getFact()
      expect(fact).toBe('Quantum computing promises to revolutionize cryptography.')
    })
  })

  describe('_getRandomTopic', () => {
    it('returns a SpaceTopic when random value corresponds to index 0', () => {
      Math.random = jest.fn().mockReturnValue(0)
      const topic = spaceModule._getRandomTopic()
      expect(topic).toBeInstanceOf(spaceModule.SpaceTopic)
      expect(topic.id).toBe(1)
      expect(topic.name).toBe('Space')
    })

    it('returns a CookingTopic when random value corresponds to index 1', () => {
      Math.random = jest.fn().mockReturnValue(0.4)
      const topic = spaceModule._getRandomTopic()
      expect(topic).toBeInstanceOf(spaceModule.CookingTopic)
      expect(topic.id).toBe(2)
      expect(topic.name).toBe('Cooking')
    })

    it('returns a TechnologyTopic when random value corresponds to index 2', () => {
      Math.random = jest.fn().mockReturnValue(0.7)
      const topic = spaceModule._getRandomTopic()
      expect(topic).toBeInstanceOf(spaceModule.TechnologyTopic)
      expect(topic.id).toBe(3)
      expect(topic.name).toBe('Technology')
    })
  })
})
