import Button from 'ui/Button'

import TableComponent from './Table'

const Template = (args) => {
  return <TableComponent {...args} />
}

export const Table = Template.bind({})

Table.args = {
  data: [
    {
      col1: 'Hello',
      col2: 'World',
      col3: 'undefined',
    },
    {
      col1: 'react-table',
      col2: 'rocks',
      col3: '!!!!',
    },
    {
      col1: 'whatever',
      col2: 'you want',
      col3: 'col3',
    },
  ],
  columns: [
    {
      id: 'col1',
      header: 'Header 1',
      accessorKey: 'col1',
      width: 'w-2/5',
      cell: (info) => info.getValue(),
    },
    {
      id: 'col2',
      header: 'Header 2',
      accessorKey: 'col2',
      width: 'w-2/5',
      cell: (info) => info.getValue(),
    },
    {
      id: 'col3',
      header: 'Header 1',
      accessorKey: 'col3',
      width: 'w-1/5',
      cell: (info) => info.getValue(),
    },
  ],
}

export const TableWithButton = Template.bind({})

TableWithButton.args = {
  data: [
    {
      col1: 'Hello',
      col2: 'World',
      col3: null,
    },
    {
      col1: 'react-table',
      col2: 'rocks',
      col3: null,
    },
    {
      col1: 'whatever',
      col2: 'you want',
      col3: <Button variant="primary">Activate</Button>,
    },
  ],
  columns: [
    {
      id: 'col1',
      header: 'Header 1',
      accessorKey: 'col1',
      cell: (info) => info.getValue(),
    },
    {
      id: 'col2',
      header: 'Header 2',
      accessorKey: 'col2',
      cell: (info) => info.getValue(),
    },
    {
      id: 'col3',
      header: '',
      accessorKey: 'col3',
      cell: (info) => info.getValue(),
    },
  ],
}

export default {
  title: 'old_ui/Table',
  component: TableComponent,
}
