import { render, screen } from '@testing-library/react'

import AvatarSVG from './AvatarSVG.js'

describe('AvatarSVG', () => {
  const args = {
    letter: 'a',
  }

  it('renders an SVG', () => {
    render(<AvatarSVG {...args} />)
    const svg = screen.getByTestId('svg-avatar')
    expect(svg).toBeInTheDocument()
  })

  it('renders the correct letter in the svg', () => {
    render(<AvatarSVG {...args} />)
    const text = screen.getByTestId('svg-avatar-text')
    const textValue = screen.getByText(args.letter)

    expect(text).toBeInTheDocument()
    expect(textValue).toBeInTheDocument()
  })
})
