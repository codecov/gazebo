import isNumber from 'lodash/isNumber'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account/useAccountDetails'
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

const UserText: React.FC = () => {
  return <p>5 seats already included in this plan</p>
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
      <UserText />
      <StudentText activatedStudents={activatedStudentCount} />
    </div>
  )
}

export default UserCount
