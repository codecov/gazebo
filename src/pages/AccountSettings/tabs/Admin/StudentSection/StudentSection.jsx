import PropTypes from 'prop-types'

function StudentSection({ isStudent }) {
  if (!isStudent) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Student access</h1>
      <p>
        Your account is marked as a student, and will be given free access to
        organizations.
      </p>
    </div>
  )
}

StudentSection.propTypes = {
  isStudent: PropTypes.bool,
}

export default StudentSection
