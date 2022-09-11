import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import FullLayout from './FullLayout'

jest.mock('../shared/ErrorBoundary', () => ({ children }) => <>{children}</>)

const batmanQuote =
  'Why do we fall? So that we can learn to pick ourselves back up.'

describe('FullLayout', () => {
  function setup(content) {
    render(<FullLayout>{content}</FullLayout>, {
      wrapper: MemoryRouter,
    })
  }

  describe('it renders with no children', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the scaffolding but no content', () => {
      const layout = screen.getByTestId('full-layout')
      expect(layout).toBeEmptyDOMElement()
    })
  })

  describe('it renders with children', () => {
    beforeEach(() => {
      setup(<p>{batmanQuote}</p>)
    })

    it('renders the content of the page (children)', () => {
      const content = screen.getByText(batmanQuote)
      expect(content).toBeInTheDocument()
    })
  })
})
