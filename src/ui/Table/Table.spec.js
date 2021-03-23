import Table from './Table'
import { render, screen } from '@testing-library/react'

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
    accessor: 'col1', // accessor is the "key" in the data
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
  let wrapper

  describe('render Table', () => {
    it('renders table', () => {
      wrapper = render(<Table data={data} columns={columns} />)
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  describe('renders headers', () => {
    it('renders table headers', () => {
      wrapper = render(<Table data={data} columns={columns} />)
      const headerRow = screen.getByTestId('header-row')
      expect(headerRow.children.length).toBe(1)
      let header = wrapper.getByText('Header 1')
      expect(header).toBeInTheDocument()
      header = wrapper.getByText('Header 2')
      expect(header).toBeInTheDocument()
      header = wrapper.getByText('Header 3')
      expect(header).toBeInTheDocument()
      expect(headerRow).toBeInTheDocument()
    })
  })

  describe('renders body', () => {
    it('renders table cells', () => {
      wrapper = render(<Table data={data} columns={columns} />)
      const bodyRow = screen.getByTestId('body-row')
      expect(bodyRow.children.length).toBe(3)
      let cell = wrapper.getByText('Row1Col1')
      expect(cell).toBeInTheDocument()
      cell = wrapper.getByText('Row1Col2')
      expect(cell).toBeInTheDocument()
      cell = wrapper.getByText('Row1Col2')
      expect(cell).toBeInTheDocument()
      cell = wrapper.getByText('Row1Col3')
      expect(cell).toBeInTheDocument()
      cell = wrapper.getByText('Row2Col3')
      expect(cell).toBeInTheDocument()
      cell = wrapper.getByText('Row2Col3')
      expect(cell).toBeInTheDocument()
      cell = wrapper.getByText('Row3Col1')
      expect(cell).toBeInTheDocument()
      cell = wrapper.getByText('Row3Col2')
      expect(cell).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('renders custom columns width correctly', () => {
    it('renders table with full variant', () => {
      const _columns = [
        {
          Header: 'Header 1',
          accessor: 'col1', // accessor is the "key" in the data
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
      wrapper = render(<Table data={data} columns={_columns} />)
      let cell = wrapper.getByText('Row1Col1')
      expect(cell.className).toMatch('w-1/12')
      cell = wrapper.getByText('Row1Col2')
      expect(cell.className).toMatch('w-6/12')
      cell = wrapper.getByText('Row1Col3')
      expect(cell.className).toMatch('w-5/12')
    })
  })
})
