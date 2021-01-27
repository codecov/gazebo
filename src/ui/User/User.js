import PropTypes from 'prop-types'
import cs from 'classnames'

const UserClasses = {
  root: 'flex text-md text-sm space-x-4',
  avatar: 'flex-none rounded-full h-12 w-12',
  content: 'flex-1 flex flex-col justify-center',
  identity: 'flex flex-wrap',
  name: 'text-gray-900 font-bold mr-1',
  username: 'text-gray-400 font-bold',
  pills: 'flex flex-wrap text-sm space-x-2 mt-1',
  pill: 'flex-initial bg-gray-200 text-gray-900 rounded-full px-3',
}

function createUserPills({ student, isAdmin, email }) {
  const pills = []

  if (isAdmin) pills.push({ text: 'Admin', highlight: true })
  if (student) pills.push({ text: 'Student' })
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
    <div className={cs(className, UserClasses.root)}>
      <img className={UserClasses.avatar} src={avatarUrl} alt={username} />
      <div className={UserClasses.content}>
        <div className={UserClasses.identity}>
          <span className={UserClasses.name}>{name}</span>
          <span className={UserClasses.username}>@{username}</span>
        </div>
        <div className={UserClasses.pills}>
          {pills.map(({ text, highlight }, i) => (
            <span
              key={`pill-${username}-${i}`}
              className={cs(UserClasses.pill, {
                'bg-gray-300': highlight,
              })}
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
