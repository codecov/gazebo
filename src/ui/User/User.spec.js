import { render, screen } from '@testing-library/react'

import User from './User'

describe('User', () => {
  const requiredProps = {
    avatarUrl: 'https://good.dog/🐕.jpeg',
    username: 'gaurd2003',
  }
  function setup(props) {
    render(<User {...requiredProps} {...props} />)
  }

  describe('when rendered with no props', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the avatar', () => {
      const avatar = screen.getByRole('img', { name: /gaurd2003/ })
      expect(avatar).toBeInTheDocument()
    })

    it(`renders the username`, () => {
      const username = screen.getByText(/gaurd2003/)
      expect(username).toBeInTheDocument()
    })
  })

  describe('renders name', () => {
    beforeEach(() => {
      setup({ name: 'Sir Roofus' })
    })

    it(`renders user's name`, () => {
      const name = screen.getByText(/Sir Roofus/)
      expect(name).toBeInTheDocument()
    })
  })

  describe('renders email', () => {
    beforeEach(() => {
      setup({ email: 'gaurd2003@neighborhood.howl' })
    })

    it(`renders user's email`, () => {
      const email = screen.getByText(/gaurd2003@neighborhood.howl/)
      expect(email).toBeInTheDocument()
    })
  })

  describe('renders isAdmin', () => {
    beforeEach(() => {
      setup({ isAdmin: true })
    })

    it(`renders user's admin status`, () => {
      const adminPill = screen.getByText(/Admin/)
      expect(adminPill).toBeInTheDocument()
    })

    it('highlights admin status', () => {
      const adminPill = screen.getByText(/Admin/)
      expect(adminPill).toHaveClass('bg-gray-300')
    })
  })

  describe('renders student', () => {
    beforeEach(() => {
      setup({ student: true })
    })

    it(`renders student status`, () => {
      const studentPill = screen.getByText(/Student/)
      expect(studentPill).toBeInTheDocument()
    })
  })
})
