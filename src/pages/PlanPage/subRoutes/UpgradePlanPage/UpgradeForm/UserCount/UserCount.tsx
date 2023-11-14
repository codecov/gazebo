import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'

import { isTeamPlan } from 'shared/utils/billing'

interface StudentTextProps {
  activatedStudents?: number
}

const StudentText: React.FC<StudentTextProps> = ({ activatedStudents }) => {
  if (!isNumber(activatedStudents) || activatedStudents < 1) {
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

StudentText.propTypes = {
  activatedStudents: PropTypes.number,
}

interface UserTextProps {
  activatedUserCount: number
  inactiveUserCount: number
  isSentryUpgrade: boolean
  planString: string
}

const UserText: React.FC<UserTextProps> = ({
  activatedUserCount,
  inactiveUserCount,
  isSentryUpgrade,
  planString,
}) => {
  if (isSentryUpgrade && !isTeamPlan(planString)) {
    return <p>5 seats already included in this plan</p>
  }

  return (
    <p>
      Your organization has {activatedUserCount + inactiveUserCount} members.
    </p>
  )
}

UserText.propTypes = {
  activatedUserCount: PropTypes.number.isRequired,
  inactiveUserCount: PropTypes.number.isRequired,
  isSentryUpgrade: PropTypes.bool.isRequired,
}

interface UserCountProps {
  activatedUserCount?: number
  inactiveUserCount?: number
  activatedStudentCount?: number
  isSentryUpgrade: boolean
  planString: string
}

const UserCount: React.FC<UserCountProps> = ({
  activatedUserCount,
  inactiveUserCount,
  activatedStudentCount,
  isSentryUpgrade,
  planString,
}) => {
  if (!isNumber(activatedUserCount) || !isNumber(inactiveUserCount)) {
    return null
  }

  return (
    <div className="border-l-2 pl-2">
      <UserText
        activatedUserCount={activatedUserCount}
        inactiveUserCount={inactiveUserCount}
        isSentryUpgrade={isSentryUpgrade}
        planString={planString}
      />
      <StudentText activatedStudents={activatedStudentCount} />
    </div>
  )
}

UserCount.propTypes = {
  activatedUserCount: PropTypes.number,
  inactiveUserCount: PropTypes.number,
  activatedStudentCount: PropTypes.number,
  isSentryUpgrade: PropTypes.bool.isRequired,
}

export default UserCount
