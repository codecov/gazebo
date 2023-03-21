import { render, screen } from '@testing-library/react'

import { useImage } from 'services/image'

import Avatar from '.'

jest.mock('services/image')

describe('Avatar', () => {
  function setup({ useImageReturn }) {
    const useImageMock = jest.fn(() => useImageReturn)
    useImage.mockImplementation(useImageMock)
    return {
      useImageMock,
    }
  }

  it('renders an image with the correct attributes', () => {
    setup({
      useImageReturn: {
        src: 'https://avatars0.githubusercontent.com/u/1060902?v=3&s=55',
        isError: false,
      },
    })

    render(
      <Avatar
        user={{
          user: {
            username: 'laudna',
            avatarUrl:
              'https://avatars0.githubusercontent.com/u/1060902?v=3&s=55',
          },
        }}
      />
    )

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute(
      'src',
      'https://avatars0.githubusercontent.com/u/1060902?v=3&s=55'
    )
    expect(img).toHaveAttribute('alt', 'avatar')
  })

  it('renders the avatar SVG if theres an error', () => {
    setup({
      useImageReturn: {
        src: null,
        error: true,
      },
    })

    render(
      <Avatar
        user={{
          user: {
            username: 'laudna',
            avatarUrl:
              'https://avatars0.githubusercontent.com/u/1060902?v=3&s=55',
          },
        }}
      />
    )

    const avatarSVG = screen.getByTestId('svg-avatar')
    expect(avatarSVG).toBeInTheDocument()
  })
})
