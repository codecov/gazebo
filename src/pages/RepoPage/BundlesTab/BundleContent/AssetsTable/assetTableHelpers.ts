import {
  formatBundlePercentage,
  formatSizeToString,
} from 'shared/utils/bundleAnalysis'

export const genSizeColumn = ({
  size,
  totalBundleSize,
}: {
  size: number
  totalBundleSize: number | null | undefined
}) => {
  const formattedSize = formatSizeToString(size)
  if (!totalBundleSize || totalBundleSize === null) {
    return formattedSize
  }

  const percentage = formatBundlePercentage(size / totalBundleSize)
  return `${percentage} (${formattedSize})`
}

export const sortSizeColumn = ({
  rowA,
  rowB,
  totalBundleSize,
}: {
  rowA: number
  rowB: number
  totalBundleSize: number | null | undefined
}) => {
  if (!totalBundleSize || totalBundleSize === null) {
    return rowA > rowB ? 1 : rowA < rowB ? -1 : 0
  }

  const a = rowA / totalBundleSize
  const b = rowB / totalBundleSize
  return a > b ? 1 : a < b ? -1 : 0
}

export const sortChangeOverTimeColumn = ({
  rowA,
  rowB,
}: {
  rowA: number | null | undefined
  rowB: number | null | undefined
}) => {
  if (rowA && rowB) {
    const a = Math.abs(rowA)
    const b = Math.abs(rowB)
    return a > b ? 1 : a < b ? -1 : 0
  }

  return -1
}
