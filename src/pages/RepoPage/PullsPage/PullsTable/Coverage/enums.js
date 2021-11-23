export const PullStateEnum = {
  MERGED: 'MERGED',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
}

export const IconEnum = [
  {
    state: PullStateEnum.MERGED,
    name: 'merge',
  },
  {
    state: PullStateEnum.CLOSED,
    name: 'pullRequestClosed',
  },
  {
    state: PullStateEnum.OPEN,
    name: 'pullRequestOpen',
  },
]
