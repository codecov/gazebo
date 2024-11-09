export function getOwnerImg(provider: string, owner: string | null) {
  if (!owner) {
    return
  }

  return {
    gh: `https://github.com/${owner}.png?size=40`,
    github: `https://github.com/${owner}.png?size=40`,
  }[provider]
}
