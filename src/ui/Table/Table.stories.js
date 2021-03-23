import TableComponent from './Table'
import Button from '../../old_ui/Button/Button'

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
      Header: 'Header 1',
      accessor: 'col1', // accessor is the "key" in the data
    },
    {
      Header: 'Header 2',
      accessor: 'col2',
    },
    {
      Header: 'Header 1',
      accessor: 'col3',
    },
  ],
  variant: 'full',
}

export const TableWithButton = Template.bind({})

TableWithButton.args = {
  data: [
    {
      col1: 'Hello',
      col2: 'World',
      col3: undefined,
    },
    {
      col1: 'react-table',
      col2: 'rocks',
      col3: undefined,
    },
    {
      col1: 'whatever',
      col2: 'you want',
      col3: <Button>Activate</Button>,
    },
  ],
  columns: [
    {
      Header: 'Header 1',
      accessor: 'col1', // accessor is the "key" in the data
    },
    {
      Header: 'Header 2',
      accessor: 'col2',
    },
    {
      Header: '',
      accessor: 'col3',
    },
  ],
  variant: 'full',
}

export default {
  title: 'Components/Table',
  component: TableComponent,
}
