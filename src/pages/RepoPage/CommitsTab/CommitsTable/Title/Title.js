import PropTypes from 'prop-types'

import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Avatar, { DefaultAuthor } from 'ui/Avatar'

const Title = ({ message, author, commitid, createdAt }) => {
  const user = {
    avatarUrl: author?.avatarUrl || DefaultAuthor.AVATAR_URL,
    username: author?.username || DefaultAuthor.USERNAME,
  }

  const commitMessage = () => {
    if (!message) return 'commit message unavailable'
    const msg =
      message?.length < 50
        ? message?.slice(0, 50)
        : message?.slice(0, 50) + '...'
    return msg
  }

  return (
    <div className="flex flex-row w-96 lg:w-auto">
      <span className="flex items-center mr-5">
        <Avatar user={user} bordered />
      </span>
      <div className="flex flex-col w-5/6 lg:w-auto">
        <A to={{ pageName: 'commit', options: { commit: commitid } }}>
          <h2 className="font-medium text-sm md:text-base text-black">
            {commitMessage()}
          </h2>
        </A>
        <p className="text-xs">
          <A to={{ pageName: 'owner' }}>
            <span className="text-black">{author?.username}</span>
          </A>
          {createdAt && (
            <span className="text-ds-gray-quinary">
              {' '}
              opened {formatTimeToNow(createdAt)}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

Title.propTypes = {
  author: PropTypes.shape({
    username: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  commitid: PropTypes.string,
  message: PropTypes.string,
  createdAt: PropTypes.string,
}

export default Title
