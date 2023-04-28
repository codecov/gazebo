import CoverageProgressComponent from './CoverageProgress'

export const CoverageProgress = {
  args: { amount: 50, color: 'primary' },
}

export const CoverageProgressNoReport = {
  args: {
    amount: null,
    color: 'primary',
  },
}

export default {
  title: 'Components/CoverageProgress',
  component: CoverageProgressComponent,
  argTypes: {
    color: {
      type: 'select',
      options: ['primary', 'neutral', 'danger', 'warning'],
    },
  },
}
