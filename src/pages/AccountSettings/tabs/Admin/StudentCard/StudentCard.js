import PropTypes from 'prop-types'

import Card from 'ui/Card'
import { useDateFormatted } from 'shared/utils/dates'

function StudentCard({ user }) {
  const createdAt = useDateFormatted(user.studentCreatedAt)
  const updatedAt = useDateFormatted(user.studentUpdatedAt)

  if (!createdAt) return null

  return (
    <Card className="p-10 mt-8">
      <h1 className="text-2xl bold">Student details</h1>
      <div className="mt-4 flex">
        <div>
          <h5 className="bold">Status</h5>
          {user.student ? 'Active' : 'Inactive'}
        </div>
        <div className="ml-32">
          <h5 className="bold">{user.student ? 'Since' : 'Started'}</h5>
          {createdAt}
        </div>
        {!user.student && (
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
  user: PropTypes.shape({
    student: PropTypes.bool.isRequired,
    studentCreatedAt: PropTypes.string.isRequired,
    studentUpdatedAt: PropTypes.string.isRequired,
  }).isRequired,
}

export default StudentCard
