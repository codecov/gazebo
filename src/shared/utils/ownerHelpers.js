export function getOwnerImg(provider, owner) {
  return {
    gh: `https://github.com/${owner}.png?size=40`,
  }[provider]
}
