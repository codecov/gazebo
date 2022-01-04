import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import PropTypes from 'prop-types'

import Avatar from 'ui/Avatar'
import A from 'ui/A'
import { useOwner } from 'services/user'
import { commitRequestType } from 'shared/propTypes'

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

const Title = ({ commit }) => {
  const commitMessage = () => {
    if (!commit.message) return 'commit message unavailable'
    const msg =
      commit?.message?.length < 50
        ? commit?.message?.slice(0, 50)
        : commit?.message?.slice(0, 50) + '...'
    return msg
  }

  return (
    <div className="flex flex-row w-96 lg:w-auto">
      <OwnerData username={commit?.author?.username} />
      <div className="flex flex-col w-5/6 lg:w-auto">
        <A to={{ pageName: 'commit', options: { commit: commit?.commitid } }}>
          <h2 className="font-medium text-sm md:text-base text-black">
            {commitMessage()}
          </h2>
        </A>
        <p className="text-xs">
          <A to={{ pageName: 'owner' }}>
            <span className="text-black">{commit?.author?.username}</span>
          </A>
          {commit?.createdAt && (
            <span className="text-ds-gray-quinary">
              {' opened ' +
                formatDistanceToNow(new Date(commit?.createdAt), {
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
  commit: commitRequestType,
}

export default Title
