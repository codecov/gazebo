import SummaryField from './SummaryField'

export const DefaultSummaryField = {
  args: {
    title: 'Sample title',
    children: <span>Simple markup</span>,
  },
}

export const SummaryFieldNoTitle = {
  args: {
    title: null,
    children: <span>Simple markup</span>,
  },
}

export const SummaryFieldNoChildren = {
  args: {
    title: 'Another sample title',
    children: null,
  },
}

export default {
  title: 'Components/Summary/SummaryField',
  component: SummaryField,
}
