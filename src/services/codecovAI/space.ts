interface Topic {
  id: number
  name: string
  getFact(): string
}

class SpaceTopic implements Topic {
  id = 1
  name = 'Space'
  getFact(): string {
    const facts = [
      'The universe is expanding at an accelerating rate.',
      'Black holes can warp space and time.',
      'Stars are born in cosmic nurseries called nebulae.',
    ]
    return facts[Math.floor(Math.random() * facts.length)]!
  }
}

class CookingTopic implements Topic {
  id = 2
  name = 'Cooking'
  getFact(): string {
    const facts = [
      'Searing meat locks in its juices.',
      'A pinch of salt enhances sweet flavors.',
      'Baking requires precise measurements to succeed.',
    ]
    return facts[Math.floor(Math.random() * facts.length)]!
  }
}

class TechnologyTopic implements Topic {
  id = 3
  name = 'Technology'
  getFact(): string {
    const facts = [
      "Moore's law predicts the doubling of transistors every couple of years.",
      'Artificial intelligence is transforming numerous industries.',
      'Quantum computing promises to revolutionize cryptography.',
    ]
    return facts[Math.floor(Math.random() * facts.length)]!
  }
}

function _getRandomTopic(): Topic {
  const topics: Topic[] = [
    new SpaceTopic(),
    new CookingTopic(),
    new TechnologyTopic(),
  ]
  return topics[Math.floor(Math.random() * topics.length)]!
}

export { Topic, SpaceTopic, CookingTopic, TechnologyTopic, _getRandomTopic }