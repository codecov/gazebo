import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import SidebarLayout from './SidebarLayout'

vi.mock('../shared/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('layouts/Footer', () => ({ default: () => 'Footer' }))

const robinQuote = 'Holy Tintinnabulation!'
const batmanQuote =
  'Why do we fall? So that we can learn to pick ourselves back up.'

afterEach(() => {
  cleanup()
})

describe('SidebarLayout', () => {
  describe('it renders with no children', () => {
    it('renders the sidebar', () => {
      render(
        <SidebarLayout sidebar={<div>{robinQuote}</div>}></SidebarLayout>,
        { wrapper: MemoryRouter }
      )

      const sidebar = screen.getByText(robinQuote)
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('it renders with children', () => {
    it('renders the sidebar', () => {
      render(
        <SidebarLayout sidebar={<div>{robinQuote}</div>}>
          <p>{batmanQuote}</p>
        </SidebarLayout>,
        { wrapper: MemoryRouter }
      )

      const sidebar = screen.getByText(robinQuote)
      expect(sidebar).toBeInTheDocument()
    })

    it('renders the content of the page (children)', () => {
      render(
        <SidebarLayout sidebar={<div>{robinQuote}</div>}>
          <p>{batmanQuote}</p>
        </SidebarLayout>,
        { wrapper: MemoryRouter }
      )

      const content = screen.getByText(batmanQuote)
      expect(content).toBeInTheDocument()
    })
  })

  describe('it renders the content with default styles', () => {
    it('renders the sidebar', () => {
      render(
        <SidebarLayout sidebar={<div>{robinQuote}</div>}>
          <p>{batmanQuote}</p>
        </SidebarLayout>,
        { wrapper: MemoryRouter }
      )

      const content = screen.getByTestId('sidebar-content')
      expect(content).toHaveClass('pl-0 lg:pl-8')
    })
  })

  describe('it renders the content with custom styles', () => {
    it('renders the sidebar', () => {
      render(
        <SidebarLayout
          className="text-red-500"
          sidebar={<div>{robinQuote}</div>}
        >
          <p>{batmanQuote}</p>
        </SidebarLayout>,
        { wrapper: MemoryRouter }
      )

      const content = screen.getByTestId('sidebar-content')
      expect(content).toHaveClass('text-red-500')
    })
  })
})
