import isNumber from 'lodash/isNumber'

export const determineProgressColor = ({
  coverage,
  upperRange,
  lowerRange,
}: {
  coverage: number
  upperRange: number
  lowerRange: number
}) => {
  if (isNumber(coverage)) {
    if (coverage < lowerRange) {
      return 'danger'
    } else if (coverage >= lowerRange && coverage < upperRange) {
      return 'warning'
    }
    return 'primary'
  }

  return 'primary'
}
