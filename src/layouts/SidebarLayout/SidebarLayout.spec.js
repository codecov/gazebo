import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import SidebarLayout from './SidebarLayout'

jest.mock('../shared/ErrorBoundary', () => ({ children }) => <>{children}</>)
jest.mock('layouts/Footer', () => () => 'Footer')

const robinQuote = 'Holy Tintinnabulation!'
const batmanQuote =
  'Why do we fall? So that we can learn to pick ourselves back up.'

describe('SidebarLayout', () => {
  function setup(content, overrideClass) {
    render(
      <SidebarLayout
        className={overrideClass}
        sidebar={<div>{robinQuote}</div>}
      >
        {content}
      </SidebarLayout>,
      {
        wrapper: MemoryRouter,
      }
    )
  }

  describe('it renders with no children', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the sidebar', () => {
      const sidebar = screen.getByText(robinQuote)
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('it renders with children', () => {
    beforeEach(() => {
      setup(<p>{batmanQuote}</p>)
    })

    it('renders the sidebar', () => {
      const sidebar = screen.getByText(robinQuote)
      expect(sidebar).toBeInTheDocument()
    })

    it('renders the content of the page (children)', () => {
      const content = screen.getByText(batmanQuote)
      expect(content).toBeInTheDocument()
    })
  })

  describe('it renders the content with default styles', () => {
    beforeEach(() => {
      setup(<p>{batmanQuote}</p>)
    })

    it('renders the sidebar', () => {
      const content = screen.getByTestId('sidebar-content')
      expect(content).toHaveClass('pl-0 lg:pl-8')
    })
  })

  describe('it renders the content with custom styles', () => {
    beforeEach(() => {
      setup(<p>{batmanQuote}</p>, 'batcave')
    })

    it('renders the sidebar', () => {
      const content = screen.getByTestId('sidebar-content')
      expect(content).toHaveClass('batcave')
    })
  })
})
