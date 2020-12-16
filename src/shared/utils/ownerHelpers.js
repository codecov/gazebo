export function getOwnerImg(provider, owner) {
  return {
    gh: `https://github.com/${owner}.png?size=40`,
    bb: `https://bitbucket.org/account/${owner}/avatar/40`,
  }[provider]
}
