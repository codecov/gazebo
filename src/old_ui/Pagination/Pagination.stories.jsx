import Pagination from './Pagination'

export const NormalPagination = {
  args: {
    results: 20,
    pointer: 10,
  },
}

export default {
  title: 'old_ui/Components/Pagination',
  component: Pagination,
  argTypes: { onPageChange: { action: 'clicked' } },
}
