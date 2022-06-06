import { render, screen, within } from '@testing-library/react'

import Table from './Table'

const data = [
  {
    col1: 'Row1Col1',
    col2: 'Row1Col2',
    col3: 'Row1Col3',
  },
  {
    col1: 'Row2Col1',
    col2: 'Row2Col2',
    col3: 'Row2Col3',
  },
  {
    col1: 'Row3Col1',
    col2: 'Row3Col2',
    col3: <button>Button Here</button>,
  },
]
const columns = [
  {
    Header: 'Header 1',
    accessor: 'col1',
  },
  {
    Header: 'Header 2',
    accessor: 'col2',
  },
  {
    Header: 'Header 3',
    accessor: 'col3',
  },
]

describe('Table', () => {
  describe('render Table', () => {
    it('renders table', () => {
      render(<Table data={data} columns={columns} />)
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  describe('renders headers', () => {
    it('renders table headers', () => {
      render(<Table data={data} columns={columns} />)
      const headerRow = screen.getByTestId('header-row')
      expect(within(headerRow).getAllByRole('row').length).toBe(1)

      let header = screen.getByText('Header 1')
      expect(header).toBeInTheDocument()
      header = screen.getByText('Header 2')
      expect(header).toBeInTheDocument()
      header = screen.getByText('Header 3')
      expect(header).toBeInTheDocument()
      expect(headerRow).toBeInTheDocument()
    })
  })

  describe('renders body', () => {
    it('renders table cells', () => {
      render(<Table data={data} columns={columns} />)
      const bodyRow = screen.getByTestId('body-row')
      expect(within(bodyRow).getAllByRole('row').length).toBe(3)

      let cell = screen.getByText('Row1Col1')
      expect(cell).toBeInTheDocument()
      cell = screen.getByText('Row1Col2')
      expect(cell).toBeInTheDocument()
      cell = screen.getByText('Row1Col2')
      expect(cell).toBeInTheDocument()
      cell = screen.getByText('Row1Col3')
      expect(cell).toBeInTheDocument()
      cell = screen.getByText('Row2Col3')
      expect(cell).toBeInTheDocument()
      cell = screen.getByText('Row2Col3')
      expect(cell).toBeInTheDocument()
      cell = screen.getByText('Row3Col1')
      expect(cell).toBeInTheDocument()
      cell = screen.getByText('Row3Col2')
      expect(cell).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('renders custom columns width correctly', () => {
    it('renders table with full variant', () => {
      const _columns = [
        {
          Header: 'Header 1',
          accessor: 'col1',
          width: 'w-1/12',
        },
        {
          Header: 'Header 2',
          accessor: 'col2',
          width: 'w-6/12',
        },
        {
          Header: 'Header 3',
          accessor: 'col3',
          width: 'w-5/12',
        },
      ]
      render(<Table data={data} columns={_columns} />)
      let cell = screen.getByText('Row1Col1')
      expect(cell.className).toMatch('w-1/12')
      cell = screen.getByText('Row1Col2')
      expect(cell.className).toMatch('w-6/12')
      cell = screen.getByText('Row1Col3')
      expect(cell.className).toMatch('w-5/12')
    })
  })

  describe('when sorting is enabled and a header is clicked', () => {
    it('onSort is called', async () => {
      const onSort = jest.fn()
      render(<Table data={data} columns={columns} onSort={onSort} />)
      screen.getByText('Header 1').click()
      expect(onSort).toHaveBeenCalled()
    })
  })
})
