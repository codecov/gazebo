import { render, screen } from '@testing-library/react'

import * as hooks from 'services/image/hooks'

import Avatar from '.'

describe('Avatar', () => {
  const args = {
    user: {
      username: 'andrewyaeger',
      avatarUrl: 'https://avatars0.githubusercontent.com/u/1060902?v=3&s=55',
    },
  }

  it('renders an image with the correct attributes', () => {
    jest.spyOn(hooks, 'useImage').mockImplementation(() => ({
      src: args.user.avatarUrl,
      error: false,
    }))

    render(<Avatar user={args.user} />)

    const img = screen.getByRole('img')

    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', args.user.avatarUrl)
    expect(img).toHaveAttribute('alt', args.user.alt)
  })

  it('renders the avatar SVG if theres an error', () => {
    jest.spyOn(hooks, 'useImage').mockImplementation(() => ({
      src: null,
      error: true,
    }))

    render(<Avatar user={args.user} />)

    const avatarSVG = screen.getByTestId('svg-avatar')
    expect(avatarSVG).toBeInTheDocument()
  })
})
