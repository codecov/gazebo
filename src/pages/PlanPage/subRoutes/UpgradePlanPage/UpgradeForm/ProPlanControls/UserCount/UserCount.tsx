import isNumber from 'lodash/isNumber'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'

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
}

const UserText: React.FC<UserTextProps> = ({
  activatedUserCount,
  inactiveUserCount,
}) => {
  return (
    <p>
      Your organization has {activatedUserCount + inactiveUserCount} members.
    </p>
  )
}

UserText.propTypes = {
  activatedUserCount: PropTypes.number.isRequired,
  inactiveUserCount: PropTypes.number.isRequired,
}

interface UserCountProps {
  activatedUserCount?: number
  inactiveUserCount?: number
  activatedStudentCount?: number
}

// This component has very little different logic from sentry (just a copy change). I still think it's worth having it here
// In a separate file, but putting it out there to see what we think
const UserCount: React.FC<UserCountProps> = () => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: accountDetails } = useAccountDetails({ provider, owner })

  const activatedStudentCount = accountDetails?.activatedStudentCount
  const activatedUserCount = accountDetails?.activatedUserCount
  const inactiveUserCount = accountDetails?.inactiveUserCount

  if (!isNumber(activatedUserCount) || !isNumber(inactiveUserCount)) {
    return null
  }

  return (
    <div className="border-l-2 pl-2">
      <UserText
        activatedUserCount={activatedUserCount}
        inactiveUserCount={inactiveUserCount}
      />
      <StudentText activatedStudents={activatedStudentCount} />
    </div>
  )
}

export default UserCount
