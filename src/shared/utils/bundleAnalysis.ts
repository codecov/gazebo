const KILOBYTE = 1_000
const MEGABYTE = 1_000_000
const GIGABYTE = 1_000_000_000

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
      maximumFractionDigits: 0,
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

const SECOND = 1_000

export const formatTimeToString = (milliseconds: number) => {
  if (milliseconds > SECOND) {
    return Intl.NumberFormat('en-US', {
      ...formatSettings,
      unit: 'second',
    }).format(milliseconds / SECOND)
  }

  return Intl.NumberFormat('en-US', {
    ...formatSettings,
    unit: 'millisecond',
  }).format(milliseconds)
}

export const formatBundlePercentage = (percentage: number) => {
  return Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(percentage)
}

export const findBundleMultiplier = (bytes: number) => {
  const positiveBytes = Math.abs(bytes)

  if (positiveBytes < KILOBYTE) {
    return 1
  }

  if (positiveBytes >= KILOBYTE && positiveBytes < MEGABYTE) {
    return KILOBYTE
  }

  if (positiveBytes >= MEGABYTE && positiveBytes < GIGABYTE) {
    return MEGABYTE
  }

  return GIGABYTE
}
