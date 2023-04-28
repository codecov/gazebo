import TotalsNumber from './TotalsNumber'

export const NumberWithChange = {
  args: {
    value: 22,
    showChange: true,
  },
}

export const NegativeNumber = {
  args: {
    value: -39,
  },
}

export const LargeNumberWithChange = {
  args: {
    value: 78,
    large: true,
    showChange: true,
  },
}

export const LargeNegativeNumberWithChange = {
  args: {
    value: -63,
    showChange: true,
    large: true,
  },
}

export const PlainLargeNumber = {
  args: {
    value: 78,
    large: true,
    plain: true,
  },
}

export const LightNumber = {
  args: {
    value: 61,
    light: true,
  },
}

export const NoValue = {
  args: {
    value: 0,
  },
}

export default {
  title: 'Components/TotalsNumber',
  component: TotalsNumber,
}
