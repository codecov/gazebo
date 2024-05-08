import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Table from './Table'

describe('Table', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  describe('render Table', () => {
    it('renders table', () => {
      render(
        <Table
          data={[
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
          ]}
          columns={[
            {
              header: 'Header 1',
              accessorKey: 'col1',
              cell: (info) => info.getValue(),
            },
            {
              header: 'Header 2',
              accessorKey: 'col2',
              cell: (info) => info.getValue(),
            },
            {
              header: 'Header 3',
              accessorKey: 'col3',
              cell: (info) => info.getValue(),
            },
          ]}
        />
      )

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  describe('renders headers', () => {
    it('renders table headers', () => {
      render(
        <Table
          data={[
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
          ]}
          columns={[
            {
              header: 'Header 1',
              accessorKey: 'col1',
              cell: (info) => info.getValue(),
              justifyStart: true,
            },
            {
              header: 'Header 2',
              accessorKey: 'col2',
              cell: (info) => info.getValue(),
            },
            {
              header: 'Header 3',
              accessorKey: 'col3',
              cell: (info) => info.getValue(),
            },
          ]}
        />
      )

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
      render(
        <Table
          data={[
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
          ]}
          columns={[
            {
              header: 'Header 1',
              accessorKey: 'col1',
              cell: (info) => info.getValue(),
            },
            {
              header: 'Header 2',
              accessorKey: 'col2',
              cell: (info) => info.getValue(),
            },
            {
              header: 'Header 3',
              accessorKey: 'col3',
              cell: (info) => info.getValue(),
            },
          ]}
        />
      )

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
          header: 'Header 1',
          accessorKey: 'col1',
          width: 'w-1/12',
          cell: (info) => info.getValue(),
        },
        {
          header: 'Header 2',
          accessorKey: 'col2',
          width: 'w-6/12',
          cell: (info) => info.getValue(),
        },
        {
          header: 'Header 3',
          accessorKey: 'col3',
          width: 'w-5/12',
          cell: (info) => info.getValue(),
        },
      ]
      render(
        <Table
          data={[
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
          ]}
          columns={_columns}
        />
      )

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
      const { user } = setup()
      const onSort = jest.fn()
      render(
        <Table
          data={[
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
          ]}
          columns={[
            {
              header: 'Header 1',
              accessorKey: 'col1',
              cell: (info) => info.getValue(),
            },
            {
              header: 'Header 2',
              accessorKey: 'col2',
              cell: (info) => info.getValue(),
            },
            {
              header: 'Header 3',
              accessorKey: 'col3',
              cell: (info) => info.getValue(),
            },
          ]}
          onSort={onSort}
        />
      )

      const header = screen.getByText('Header 1')
      await user.click(header)
      expect(onSort).toHaveBeenCalled()
    })

    it('shows sorting icon', async () => {
      const { user } = setup()
      const onSort = jest.fn()
      render(
        <Table
          data={[
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
          ]}
          columns={[
            {
              header: 'Header 1',
              accessorKey: 'col1',
              cell: (info) => info.getValue(),
            },
            {
              header: 'Header 2',
              accessorKey: 'col2',
              cell: (info) => info.getValue(),
            },
            {
              header: 'Header 3',
              accessorKey: 'col3',
              cell: (info) => info.getValue(),
            },
          ]}
          onSort={onSort}
        />
      )

      const header = screen.getByText('Header 1')
      await user.click(header)
      expect(within(header).getByText('arrow-up.svg')).toBeInTheDocument()
      await user.click(header)
      expect(within(header).getByText('arrow-down.svg')).toBeInTheDocument()
      await user.click(header)
      expect(within(header).queryByText('arrow-up.svg')).toBeNull()
      expect(within(header).queryByText('arrow-down.svg')).toBeNull()
    })
  })
})
