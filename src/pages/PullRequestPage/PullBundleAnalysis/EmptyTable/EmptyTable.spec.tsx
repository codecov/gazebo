import { render, screen } from '@testing-library/react'

import EmptyTable from './EmptyTable'

describe('EmptyTable', () => {
  describe('renders table header', () => {
    it('renders name column', () => {
      render(<EmptyTable />)

      const name = screen.getByText('Bundle name')
      expect(name).toBeInTheDocument()
    })

    it('renders prevSize column', () => {
      render(<EmptyTable />)

      const prevSize = screen.getByText('Previous Size')
      expect(prevSize).toBeInTheDocument()
    })

    it('renders newSize column', () => {
      render(<EmptyTable />)

      const newSize = screen.getByText('New Size')
      expect(newSize).toBeInTheDocument()
    })

    it('renders change column', () => {
      render(<EmptyTable />)

      const change = screen.getByText('Change')
      expect(change).toBeInTheDocument()
    })
  })

  it('renders four dashes for table body', () => {
    render(<EmptyTable />)

    const dashes = screen.getAllByText('-')
    expect(dashes).toHaveLength(4)
  })
})
