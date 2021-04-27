import { render, screen } from '@testing-library/react'
import AvatarSVG from '.'

describe('AvatarSVG', () => {
  const args = {
    userName: 'pierce-m',
  }

  it('renders an SVG', () => {
    render(<AvatarSVG userName={args.userName} />)
    const svg = screen.getByTestId('svg-avatar')
    expect(svg).toBeInTheDocument()
  })

  it('renders the correct letter in the svg', () => {
    render(<AvatarSVG userName={args.userName} />)
    const text = screen.getByTestId('svg-avatar-text')
    const textValue = screen.getByText(args.userName[0])

    expect(text).toBeInTheDocument()
    expect(textValue).toBeInTheDocument()
  })
})
