export const PullStateEnum = {
  MERGED: 'MERGED',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const

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
] as const

export type IconEnumState = (typeof IconEnum)[number]['state']
