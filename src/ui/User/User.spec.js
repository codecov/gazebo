import { render, screen } from '@testing-library/react'

import User from './User'

describe('User', () => {
  const requiredProps = {
    avatarUrl: 'https://good.dog/🐕.jpeg',
    name: 'Sir Roofus',
    username: 'gaurd2003',
  }
  function setup(props) {
    render(<User {...requiredProps} {...props} />)
  }

  describe('when rendered with no pills', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the avatar', () => {
      const avatar = screen.getByRole('img', { name: /gaurd2003/ })
      expect(avatar).toBeInTheDocument()
    })

    it(`renders user's name`, () => {
      const name = screen.getByText(/Sir Roofus/)
      expect(name).toBeInTheDocument()
    })

    it(`renders the username`, () => {
      const name = screen.getByText(/gaurd2003/)
      expect(name).toBeInTheDocument()
    })
  })

  describe('renders pills', () => {
    const pills = [
      { text: 'gaurd2003@neighborhood.howl' },
      { text: 'good boi' },
    ]

    beforeEach(() => {
      setup({ pills })
    })

    it('renders correct pills', () => {
      pills.forEach(({ text }) => {
        const pill = screen.getByText(text)
        expect(pill).toBeInTheDocument()
      })
    })
  })

  describe('renders pills with highlight', () => {
    const pills = [{ text: 'gaurd2003@neighborhood.howl', highlight: true }]

    beforeEach(() => {
      setup({ pills })
    })

    it('renders pill with highlight class', () => {
      pills.forEach(({ text }) => {
        const pill = screen.getByText(text)
        expect(pill).toHaveClass('bg-gray-300')
      })
    })
  })
})
