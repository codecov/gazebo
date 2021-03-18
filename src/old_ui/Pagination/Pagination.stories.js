import Pagination from './Pagination'

const Template = (args) => <Pagination {...args} />

export const NormalPagination = Template.bind({})
NormalPagination.args = {
  results: 20,
  pointer: 10,
}

export default {
  title: 'old_ui/Components/Pagination',
  component: Pagination,
  argTypes: { onPageChange: { action: 'clicked' } },
}
