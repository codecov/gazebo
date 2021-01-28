import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '.'

describe('Pagination', () => {
  const mockOnClick = jest.fn()
  function setup(props) {
    return render(<Pagination onClick={mockOnClick} {...props} />)
  }

  describe('pointer in the center', () => {
    const props = { results: 300, pointer: 10 }

    it('filler', () => {
      setup(props)
      expect(screen.getAllByText('...').length).toBe(2)
    })

    describe.each`
      button        | location
      ${/Previous/} | ${9}
      ${'1'}        | ${1}
      ${'8'}        | ${8}
      ${'9'}        | ${9}
      ${'10'}       | ${10}
      ${'11'}       | ${11}
      ${'12'}       | ${12}
      ${'300'}      | ${300}
      ${/Next/}     | ${11}
    `('pages', ({ button, location }) => {
      let buttonEl
      beforeEach(() => {
        setup(props)
        buttonEl = screen.getByRole('button', { name: button })
      })
      it('renders expected button', () => {
        expect(buttonEl).toBeInTheDocument()
      })
      it('clicking emites the correct page data', () => {
        fireEvent.click(buttonEl)
        expect(mockOnClick).lastCalledWith(location)
      })
    })
  })

  describe('pointer at the beginning', () => {
    const props = { results: 10, pointer: 1 }
    it('filler', () => {
      setup(props)
      expect(screen.getAllByText('...').length).toBe(1)
    })

    describe('Previous', () => {
      let buttonEl
      beforeEach(() => {
        setup(props)
        buttonEl = screen.getByRole('button', { name: /Previous/ })
      })
      it('renders disabled button', () => {
        expect(buttonEl).toBeInTheDocument()
        expect(buttonEl).toBeDisabled()
      })
      it('Clicking on button does not fire event', () => {
        fireEvent.click(buttonEl)
        expect(mockOnClick.mock.calls.length).toBe(0)
      })
    })

    describe.each`
      button    | location
      ${'1'}    | ${1}
      ${'2'}    | ${2}
      ${'10'}   | ${10}
      ${/Next/} | ${2}
    `('pages', ({ button, location }) => {
      let buttonEl
      beforeEach(() => {
        setup(props)
        buttonEl = screen.getByRole('button', { name: button })
      })
      it('renders expected button', () => {
        expect(buttonEl).toBeInTheDocument()
      })
      it('clicking emites the correct page data', () => {
        fireEvent.click(buttonEl)
        expect(mockOnClick).lastCalledWith(location)
      })
    })
  })

  describe('pointer at the end', () => {
    const props = { results: 10, pointer: 10 }
    it('filler', () => {
      setup(props)
      expect(screen.getAllByText('...').length).toBe(1)
    })

    describe('Next', () => {
      let buttonEl
      beforeEach(() => {
        setup(props)
        buttonEl = screen.getByRole('button', { name: /Next/ })
      })
      it('renders disabled button', () => {
        expect(buttonEl).toBeInTheDocument()
        expect(buttonEl).toBeDisabled()
      })
      it('Clicking on button does not fire event', () => {
        fireEvent.click(buttonEl)
        expect(mockOnClick.mock.calls.length).toBe(0)
      })
    })

    describe.each`
      button        | location
      ${/Previous/} | ${9}
      ${'1'}        | ${1}
      ${'9'}        | ${9}
      ${'10'}       | ${10}
    `('pages', ({ button, location }) => {
      let buttonEl
      beforeEach(() => {
        setup(props)
        buttonEl = screen.getByRole('button', { name: button })
      })
      it('renders expected button', () => {
        expect(buttonEl).toBeInTheDocument()
      })
      it('clicking emites the correct page data', () => {
        fireEvent.click(buttonEl)
        expect(mockOnClick).lastCalledWith(location)
      })
    })
  })
})
