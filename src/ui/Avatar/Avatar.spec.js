import { render, screen } from '@testing-library/react'
import Avatar from '.'

describe('Avatar', () => {
  const args = {
    avatarUrl: 'url',
    alt: 'alt',
  }

  it('renders an image with the correct attributes', () => {
    render(<Avatar {...args} />)

    const img = screen.getByRole('img')

    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', args.avatarUrl)
    expect(img).toHaveAttribute('alt', args.alt)
  })
})
