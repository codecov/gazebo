const KILOBYTE = 1000
const MEGABYTE = 1000000
const GIGABYTE = 1000000000

const formatSettings = {
  style: 'unit',
  unitDisplay: 'narrow',
  maximumFractionDigits: 2,
} as const

export const formatSizeToString = (bytes: number) => {
  if (bytes < KILOBYTE) {
    return Intl.NumberFormat('en-US', {
      ...formatSettings,
      unit: 'byte',
    }).format(bytes)
  }

  if (bytes >= KILOBYTE && bytes < MEGABYTE) {
    let kilobytes = bytes / KILOBYTE

    return Intl.NumberFormat('en-US', {
      ...formatSettings,
      unit: 'kilobyte',
    }).format(kilobytes)
  }

  if (bytes >= MEGABYTE && bytes < GIGABYTE) {
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
