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
})
