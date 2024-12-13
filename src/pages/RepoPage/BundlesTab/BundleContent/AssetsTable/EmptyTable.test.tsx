import { render, screen } from '@testing-library/react'

import { EmptyTable, EmptyTableWithFilePath } from './EmptyTable'

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

    it('renders est. load time column', () => {
      render(<EmptyTable />)

      const loadTime = screen.getByText('Est. load time (3G)')
      expect(loadTime).toBeInTheDocument()
    })

    it('renders change over time column', () => {
      render(<EmptyTable />)

      const changeOverTime = screen.getByText('Change over time')
      expect(changeOverTime).toBeInTheDocument()
    })
  })

  it('renders four dashes for table body', () => {
    render(<EmptyTable />)

    const dashes = screen.getAllByText('-')
    expect(dashes).toHaveLength(5)
  })
})

describe('EmptyTableWithFilePath', () => {
  describe('renders table header', () => {
    it('renders asset column', () => {
      render(<EmptyTableWithFilePath />)

      const asset = screen.getByText('Asset')
      expect(asset).toBeInTheDocument()
    })

    it('renders file path column', () => {
      render(<EmptyTableWithFilePath />)

      const filePath = screen.getByText('File path')
      expect(filePath).toBeInTheDocument()
    })

    it('renders type column', () => {
      render(<EmptyTableWithFilePath />)

      const type = screen.getByText('Type')
      expect(type).toBeInTheDocument()
    })

    it('renders size column', () => {
      render(<EmptyTableWithFilePath />)

      const size = screen.getByText('Size')
      expect(size).toBeInTheDocument()
    })

    it('renders est. load time column', () => {
      render(<EmptyTableWithFilePath />)

      const loadTime = screen.getByText('Est. load time (3G)')
      expect(loadTime).toBeInTheDocument()
    })

    it('renders change over time column', () => {
      render(<EmptyTableWithFilePath />)

      const changeOverTime = screen.getByText('Change over time')
      expect(changeOverTime).toBeInTheDocument()
    })
  })

  it('renders six dashes for table body', () => {
    render(<EmptyTableWithFilePath />)

    const dashes = screen.getAllByText('-')
    expect(dashes).toHaveLength(6)
  })
})
