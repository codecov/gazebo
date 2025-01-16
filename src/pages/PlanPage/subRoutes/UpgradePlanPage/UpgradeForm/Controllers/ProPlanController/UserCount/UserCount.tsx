import isNumber from 'lodash/isNumber'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { Provider } from 'shared/api/helpers'

interface StudentTextProps {
  activatedStudents?: number
}

const StudentText: React.FC<StudentTextProps> = ({ activatedStudents }) => {
  if (!isNumber(activatedStudents) || activatedStudents < 1) {
    return null
  }

  let studentText = 'students'
  if (activatedStudents === 1) {
    studentText = 'student'
  }

  return (
    <p className="mb-4 text-xs text-ds-gray-quinary">
      *You have {activatedStudents} active {studentText} that do not count
      towards the number of active users.
    </p>
  )
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

const UserCount: React.FC = () => {
  const { provider, owner } = useParams<{ provider: Provider; owner: string }>()
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
