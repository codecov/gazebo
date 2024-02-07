const KILOBYTE = 1000
const MEGABYTE = 1000000
const GIGABYTE = 1000000000

const formatSettings = {
  style: 'unit',
  unitDisplay: 'narrow',
  maximumFractionDigits: 2,
} as const

export const formatSizeToString = (bytes: number) => {
  const positiveBytes = Math.abs(bytes)

  if (positiveBytes < KILOBYTE) {
    return Intl.NumberFormat('en-US', {
      ...formatSettings,
      unit: 'byte',
    }).format(bytes)
  }

  if (positiveBytes >= KILOBYTE && positiveBytes < MEGABYTE) {
    let kilobytes = bytes / KILOBYTE

    return Intl.NumberFormat('en-US', {
      ...formatSettings,
      unit: 'kilobyte',
    }).format(kilobytes)
  }

  if (positiveBytes >= MEGABYTE && positiveBytes < GIGABYTE) {
    let megabytes = bytes / MEGABYTE

    return Intl.NumberFormat('en-US', {
      ...formatSettings,
      unit: 'megabyte',
    }).format(megabytes)
  }

  return Intl.NumberFormat('en-US', {
    ...formatSettings,
    unit: 'gigabyte',
  }).format(bytes / GIGABYTE)
}

export const formatTimeToString = (seconds: number) => {
  return Intl.NumberFormat('en-US', {
    ...formatSettings,
    unit: 'second',
  }).format(seconds)
}
