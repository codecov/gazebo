import { isNumber } from 'lodash'

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
    return 'default'
  }

  return 'default'
}
