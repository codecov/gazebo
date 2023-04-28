import A from './A'

import Icon from '../Icon'

export const NormalA = {
  args: {
    children: 'Normal A',
  },
}

export const MixedA = {
  args: {
    children: (
      <>
        Mixed content <Icon name="search" size="sm" />
      </>
    ),
  },
}

export const LinkA = {
  args: {
    children: 'Link A',
    variant: 'link',
  },
}

export const SemiboldA = {
  args: {
    children: 'Semibold A',
    variant: 'semibold',
  },
}

export default {
  title: 'Components/A',
  component: A,
  argTypes: { onClick: { action: 'clicked' } },
}
