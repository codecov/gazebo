import { Topic, SpaceTopic, CookingTopic, TechnologyTopic, _getRandomTopic } from './space'

describe('Topic classes', () => {
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

    it('returns a fact about space', () => {
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

    it('returns a fact about cooking', () => {
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
    let techTopic: TechnologyTopic

    beforeEach(() => {
      techTopic = new TechnologyTopic()
    })

    it('has the correct id', () => {
      expect(techTopic.id).toBe(3)
    })

    it('has the correct name', () => {
      expect(techTopic.name).toBe('Technology')
    })

    it('returns a fact about technology', () => {
      const validFacts = [
        "Moore's law predicts the doubling of transistors every couple of years.",
        'Artificial intelligence is transforming numerous industries.',
        'Quantum computing promises to revolutionize cryptography.',
      ]
      
      const fact = techTopic.getFact()
      expect(validFacts).toContain(fact)
    })
  })
})
