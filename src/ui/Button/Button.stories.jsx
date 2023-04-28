import Button from './Button'

import Icon from '../Icon'

export const NormalButton = {
  args: {
    children: 'Normal button',
    variant: 'default',
    disabled: false,
  },
}

export const PrimaryButton = {
  args: {
    children: 'Primary button',
    variant: 'primary',
    disabled: false,
  },
}

export const DangerButton = {
  args: {
    children: 'Danger button',
    variant: 'danger',
    disabled: false,
  },
}

export const DisabledButton = {
  args: {
    children: 'Disabled button',
    disabled: true,
  },
}

export const SecondaryButton = {
  args: {
    children: 'Secondary button',
    variant: 'secondary',
    disabled: false,
  },
}

export const PlainButton = {
  args: {
    children: 'Plain button',
    variant: 'plain',
  },
}

export const GitHubButton = {
  args: {
    children: 'GitHub Button',
    variant: 'github',
  },
}

export const GitLabButton = {
  args: {
    children: 'GitLab Button',
    variant: 'gitlab',
  },
}

export const BitbucketButton = {
  args: {
    children: 'Bitbucket Button',
    variant: 'bitbucket',
  },
}

export const MixedButton = {
  args: {
    children: (
      <>
        Mixed content <Icon name="search" size="sm" />
      </>
    ),
  },
}

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: { onClick: { action: 'clicked' } },
}
