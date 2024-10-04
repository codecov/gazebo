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
