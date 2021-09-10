import PropTypes from 'prop-types'

import Card from 'old_ui/Card'
import { useDateFormatted } from 'shared/utils/dates'

function StudentCard({ currentUser }) {
  const isStudent = currentUser.user.student
  const createdAt = useDateFormatted(currentUser.user.studentCreatedAt)
  const updatedAt = useDateFormatted(currentUser.user.studentUpdatedAt)

  if (!createdAt) return null

  return (
    <Card className="p-10 mt-8">
      <h1 className="text-2xl bold">Student details</h1>
      <div className="mt-4 flex">
        <div>
          <h5 className="bold">Status</h5>
          {isStudent ? 'Active' : 'Inactive'}
        </div>
        <div className="ml-32">
          <h5 className="bold">{isStudent ? 'Since' : 'Started'}</h5>
          {createdAt}
        </div>
        {!isStudent && (
          <div className="ml-32">
            <h5 className="bold">Ended</h5>
            {updatedAt}
          </div>
        )}
      </div>
    </Card>
  )
}

StudentCard.propTypes = {
  currentUser: PropTypes.shape({
    user: PropTypes.shape({
      student: PropTypes.bool.isRequired,
      studentCreatedAt: PropTypes.string,
      studentUpdatedAt: PropTypes.string,
    }).isRequired,
  }).isRequired,
}

export default StudentCard
