import CIStatus from './CIStatus'

export const Passing = {
  args: {
    ciPassed: true,
  },
}

export const Failing = {
  args: {
    ciPassed: false,
  },
}

export const Processing = {
  args: {
    ciPassed: null,
  },
}

export default {
  title: 'Components/CIStatus',
  component: CIStatus,
}
