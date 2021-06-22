import { render, screen } from '@testing-library/react'

import Card from './Card'

describe('Card', () => {
  function setup(props) {
    render(<Card {...props} />)
  }

  describe('when rendered with children', () => {
    beforeEach(() => {
      setup({ children: 'hello' })
    })

    it('renders the children', () => {
      const tab = screen.getByText(/hello/)
      expect(tab).toBeInTheDocument()
    })
  })

  describe('when rendered with header', () => {
    beforeEach(() => {
      setup({ children: 'hello', header: <h1>hola</h1> })
    })

    it('renders the header', () => {
      const tab = screen.getByText(/hola/)
      expect(tab).toBeInTheDocument()
    })
  })

  describe('when rendered with footer', () => {
    beforeEach(() => {
      setup({ children: 'hello', footer: <h1>bonjour</h1> })
    })

    it('renders the header', () => {
      const tab = screen.getByText(/bonjour/)
      expect(tab).toBeInTheDocument()
    })
  })
})
