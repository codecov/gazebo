export function providerToName(provider) {
  return {
    gh: 'Github',
    bb: 'BitBucket',
    gl: 'Gitlab',
  }[provider]
}
