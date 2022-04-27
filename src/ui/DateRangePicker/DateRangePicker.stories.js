import DateRangePicker from './DateRangePicker'

const Template = (args) => <DateRangePicker {...args} />

export const BasicDateRangePicker = Template.bind({})

BasicDateRangePicker.args = {
  params: { startDate: null, endDate: null },
}

export default {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  argTypes: {
    updateParams: {
      action: 'params updated',
    },
  },
}
