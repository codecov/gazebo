import { render, screen } from '@testing-library/react'

import { EmptyTable } from './EmptyTable'

describe('EmptyTable', () => {
  describe('renders table header', () => {
    it('renders asset column', () => {
      render(<EmptyTable />)

      const asset = screen.getByText('Asset')
      expect(asset).toBeInTheDocument()
    })

    it('renders type column', () => {
      render(<EmptyTable />)

      const type = screen.getByText('Type')
      expect(type).toBeInTheDocument()
    })

    it('renders size column', () => {
      render(<EmptyTable />)

      const size = screen.getByText('Size')
      expect(size).toBeInTheDocument()
    })

    it('renders estimated load time column', () => {
      render(<EmptyTable />)

      const loadTime = screen.getByText('Estimated load time (3G)')
      expect(loadTime).toBeInTheDocument()
    })
  })

  it('renders four dashes for table body', () => {
    render(<EmptyTable />)

    const dashes = screen.getAllByText('-')
    expect(dashes).toHaveLength(4)
  })
})
