import PropTypes from 'prop-types'
import cs from 'classnames'

function createUserPills({ student, isAdmin, email }) {
  const pills = []

  if (student) pills.push({ text: 'Student' })
  if (isAdmin) pills.push({ text: 'Admin', highlight: true })
  if (email) pills.push({ text: email })

  return pills
}

function User({
  avatarUrl,
  name,
  username,
  student,
  isAdmin,
  email,
  className,
}) {
  const pills = createUserPills({ student, isAdmin, email })
  return (
    <div className={cs(className, 'flex text-md text-sm space-x-4')}>
      <img
        className="flex-none rounded-full h-12 w-12"
        src={avatarUrl}
        alt={username}
      />
      <div className="flex-1 flex flex-col justify-center">
        <div>
          <span className="text-gray-900 font-bold mr-1">{name}</span>
          <span className="text-gray-400 font-bold">@{username}</span>
        </div>
        <div className="flex text-sm space-x-2 mt-1">
          {pills.map(({ text, highlight }, i) => (
            <span
              key={`pill-${username}-${i}`}
              className={cs(
                'flex-initial flex text-sm space-x-2 bg-gray-200 text-gray-900 rounded-full px-3',
                {
                  'bg-gray-300': highlight,
                }
              )}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

User.propTypes = {
  avatarUrl: PropTypes.string.isRequired,
  name: PropTypes.string,
  username: PropTypes.string.isRequired,
  student: PropTypes.bool,
  isAdmin: PropTypes.bool,
  email: PropTypes.string,
}

export default User
