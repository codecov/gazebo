import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'

function renderStudentText(activatedStudents: number) {
  if (activatedStudents < 1) {
    return null
  }

  if (activatedStudents === 1) {
    return (
      <p className="mb-4 text-xs text-ds-gray-quinary">
        *You have {activatedStudents} active student that does not count towards
        the number of active users.
      </p>
    )
  }

  return (
    <p className="mb-4 text-xs text-ds-gray-quinary">
      *You have {activatedStudents} active students that do not count towards
      the number of active users.
    </p>
  )
}

interface UserCountProps {
  activatedUserCount?: number
  inactiveUserCount?: number
  activatedStudentCount?: number
}

const UserCount: React.FC<UserCountProps> = ({
  activatedUserCount,
  inactiveUserCount,
  activatedStudentCount,
}) => {
  if (!isNumber(activatedUserCount) || !isNumber(inactiveUserCount)) {
    return null
  }

  return (
    <div className="border-l-2 pl-2">
      <p>
        Currently {activatedUserCount} users activated out of{' '}
        {activatedUserCount + inactiveUserCount} users.
      </p>
      {isNumber(activatedStudentCount) &&
        renderStudentText(activatedStudentCount)}
    </div>
  )
}

UserCount.propTypes = {
  activatedUserCount: PropTypes.number,
  inactiveUserCount: PropTypes.number,
  activatedStudentCount: PropTypes.number,
}

export default UserCount
