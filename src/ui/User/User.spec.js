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

  describe('renders pills', () => {
    describe('simple', () => {
      beforeEach(() => {
        setup({ pills: ['foo', 'bar'] })
      })

      it(`renders pills`, () => {
        expect(screen.getByText(/foo/)).toBeInTheDocument()
        expect(screen.getByText(/bar/)).toBeInTheDocument()
      })
    })
    describe('object', () => {
      beforeEach(() => {
        setup({
          pills: [
            { label: 'foo' },
            { label: 'bar', highlight: true },
            { label: 'biz', className: 'test' },
          ],
        })
      })

      it(`renders pills`, () => {
        expect(screen.getByText(/foo/)).toBeInTheDocument()
        expect(screen.getByText(/bar/)).toBeInTheDocument()
        expect(screen.getByText(/bar/)).toHaveClass('bg-gray-300')
        expect(screen.getByText(/biz/)).toBeInTheDocument()
        expect(screen.getByText(/biz/)).toHaveClass('test')
      })
    })
    describe('mixed', () => {
      beforeEach(() => {
        setup({ pills: ['foo', { label: 'bar' }] })
      })

      it(`renders pills`, () => {
        expect(screen.getByText(/foo/)).toBeInTheDocument()
        expect(screen.getByText(/bar/)).toBeInTheDocument()
      })
    })
  })
})
