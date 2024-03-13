import isNumber from 'lodash/isNumber'

export const determineProgressColor = ({
  coverage,
  upperRange,
  lowerRange,
}: {
  coverage: number | null
  upperRange?: number | null
  lowerRange?: number | null
}) => {
  if (!isNumber(coverage) || !isNumber(upperRange) || !isNumber(lowerRange)) {
    return 'primary'
  }
  if (coverage < lowerRange) {
    return 'danger'
  } else if (coverage >= lowerRange && coverage < upperRange) {
    return 'warning'
  }
  return 'primary'
}
