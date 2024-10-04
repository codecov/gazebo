import PropTypes from 'prop-types'

import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Avatar, { DefaultAuthor } from 'ui/Avatar'

interface TitleProps {
  message?: string | null
  author?: {
    username?: string | null
    avatarUrl?: string | null
  } | null
  commitid?: string
  createdAt?: string
  flags?: string[]
}
const Title = ({
  message,
  author,
  commitid,
  createdAt,
  flags = [],
}: TitleProps) => {
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
    <div className="flex flex-1 flex-row items-center gap-4 lg:w-auto">
      <Avatar user={user} border="light" />
      <div className="flex flex-col">
        {/* @ts-ignore */}
        <A to={{ pageName: 'commit', options: { commit: commitid, flags } }}>
          <h2 className="text-sm font-semibold text-ds-secondary-text">
            {commitMessage()}
          </h2>
        </A>
        <p className="text-xs">
          {/* @ts-ignore */}
          <A to={{ pageName: 'owner' }}>
            <span className="text-ds-secondary-text">{author?.username}</span>
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
  flags: PropTypes.arrayOf(PropTypes.string),
}

export default Title
