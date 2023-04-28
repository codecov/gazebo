import DateRangePicker from './DateRangePicker'

export const BasicDateRangePicker = {
  args: {
    params: { startDate: null, endDate: null },
  },
}

export default {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  argTypes: {
    onChange: {
      action: 'params updated',
    },
  },
}
