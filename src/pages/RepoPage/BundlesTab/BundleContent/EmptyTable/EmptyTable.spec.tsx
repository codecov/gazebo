import { render, screen } from '@testing-library/react'

import EmptyTable from './EmptyTable'

describe('EmptyTable', () => {
  describe('renders table header', () => {
    it('renders name column', () => {
      render(<EmptyTable />)

      const name = screen.getByText('Bundle name')
      expect(name).toBeInTheDocument()
    })

    it('renders currSize column', () => {
      render(<EmptyTable />)

      const currSize = screen.getByText('Current size')
      expect(currSize).toBeInTheDocument()
    })

    it('renders loadTime column', () => {
      render(<EmptyTable />)

      const loadTime = screen.getByText('Estimated load time (3G)')
      expect(loadTime).toBeInTheDocument()
    })
  })

  it('renders three dashes for table body', () => {
    render(<EmptyTable />)

    const dashes = screen.getAllByText('-')
    expect(dashes).toHaveLength(3)
  })
})
