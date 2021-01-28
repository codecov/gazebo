import PropTypes from 'prop-types'
import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'

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

function User({ avatarUrl, name, username, pills = [], className }) {
  function _generatePills(item) {
    const label = typeof item === 'string' ? item : item.label
    return (
      <span
        key={`pill-${uniqueId('pill_')}`}
        className={cs(UserClasses.pill, item?.className, {
          'bg-gray-300': item?.highlight,
        })}
      >
        {label}
      </span>
    )
  }
  return (
    <div className={cs(className, UserClasses.root)}>
      <img className={UserClasses.avatar} src={avatarUrl} alt={username} />
      <div className={UserClasses.content}>
        <div className={UserClasses.identity}>
          <span className={UserClasses.name}>{name}</span>
          <span className={UserClasses.username}>@{username}</span>
        </div>
        <div className={UserClasses.pills}>
          {pills.filter(Boolean).map(_generatePills)}
        </div>
      </div>
    </div>
  )
}

User.propTypes = {
  avatarUrl: PropTypes.string.isRequired,
  name: PropTypes.string,
  username: PropTypes.string.isRequired,
  pills: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        highlight: PropTypes.bool,
        className: PropTypes.string,
      }),
    ])
  ),
}

export default User
