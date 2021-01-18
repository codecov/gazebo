import PropTypes from 'prop-types'
import cs from 'classnames'

function User({ avatarUrl, name, username, pills = [], className }) {
  return (
    <div className={cs(className, 'flex text-md text-sm space-x-4')}>
      <img className="rounded-full h-12 w-12" src={avatarUrl} alt={username} />
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
  pills: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      highlight: PropTypes.bool,
    })
  ),
}

export default User
