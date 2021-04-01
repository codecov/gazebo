import PropTypes from 'prop-types'
import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import Avatar from 'old_ui/Avatar/Avatar'

const UserClasses = {
  root: 'flex text-md text-sm space-x-4',
  avatar: 'flex-none rounded-full object-cover h-12 w-12',
  content: 'flex-1 flex flex-col justify-center',
  identity: 'flex flex-wrap',
  name: 'text-gray-900 font-bold mr-1',
  username: 'text-gray-400 font-bold',
  pills: 'flex flex-wrap text-sm space-x-2 mt-1',
  pill: 'flex-initial bg-gray-200 text-gray-900 rounded-full px-3',
}

const UserCompactClasses = {
  ...UserClasses,
  root: cs(UserClasses.root, 'items-center'),
  avatar: 'flex-none rounded-full h-8 w-8',
  content: 'flex-1 flex items-center',
  name: 'text-gray-900 font-bold mr-2',
  pills: 'flex flex-wrap text-sm space-x-2 ml-3',
}

function User({
  avatarUrl,
  name,
  username,
  pills = [],
  compact = false,
  className,
}) {
  function _generatePills(item) {
    const label = typeof item === 'string' ? item : item.label
    return (
      <span
        key={`pill-${uniqueId('pill_')}`}
        className={cs(styles.pill, item?.className, {
          'bg-gray-300': item?.highlight,
        })}
      >
        {label}
      </span>
    )
  }

  const styles = compact ? UserCompactClasses : UserClasses

  return (
    <div className={cs(className, styles.root)}>
      <Avatar
        avatarUrl={avatarUrl}
        username={username}
        className={styles.avatar}
        alt={username}
      />
      <div className={styles.content}>
        <div className={styles.identity}>
          <span className={styles.name}>{name}</span>
          <span className={styles.username}>@{username}</span>
        </div>
        <div className={styles.pills}>
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
  compact: PropTypes.bool,
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
