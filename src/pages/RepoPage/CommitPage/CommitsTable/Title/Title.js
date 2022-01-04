import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import PropTypes from 'prop-types'

import Avatar from 'ui/Avatar'
import A from 'ui/A'
import { useOwner } from 'services/user'

const OwnerData = ({ username }) => {
  const { data: ownerData } = useOwner({ username })

  return (
    <span className="flex items-center mr-6">
      <Avatar
        user={
          ownerData || {
            avatarUrl: 'https://avatars0.githubusercontent.com/u/?v=3&s=55',
            username: 'default',
          }
        }
        bordered
      />
    </span>
  )
}

OwnerData.propTypes = {
  username: PropTypes.string,
}

const Title = ({ message, author, commitid, createdAt }) => {
  const commitMessage = () => {
    if (!message) return 'commit message unavailable'
    const msg =
      message?.length < 50
        ? message?.slice(0, 50)
        : message?.slice(0, 50) + '...'
    return msg
  }

  return (
    <div className="flex flex-row">
      <OwnerData username={author?.username} />
      <div className="flex flex-col">
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
              {' opened ' +
                formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                })}
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
  }),
  commitid: PropTypes.string,
  message: PropTypes.string,
  createdAt: PropTypes.string,
}

export default Title
