import isNumber from 'lodash/isNumber'

export const determineProgressColor = ({
  coverage,
  upperRange,
  lowerRange,
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
