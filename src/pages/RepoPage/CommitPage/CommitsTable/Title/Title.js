import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Avatar from 'ui/Avatar'
import A from 'ui/A'
import PropTypes from 'prop-types'
import { useOwner } from 'services/user'

const Title = ({ commit }) => {
  const { data: ownerData } = useOwner({ username: commit?.author?.username })

  const handleCommitMessage = () => {
    if (!commit.message) return 'commit message unavailable'
    const msg =
      commit?.message?.length < 50
        ? commit?.message?.slice(0, 50)
        : commit?.message?.slice(0, 50) + '...'
    return msg
  }

  const handleOwnerData = () => {
    return (
      <span>
        <Avatar
          user={
            ownerData || {
              avatarUrl: 'https://avatars0.githubusercontent.com/u/?v=3&s=55',
              username: null,
            }
          }
          bordered
        />
      </span>
    )
  }

  return (
    <div className="flex flex-row">
      <span className="flex items-center mr-6">{handleOwnerData()}</span>
      <div className="flex flex-col">
        <A to={{ pageName: 'commit', options: { commit: commit?.commitid } }}>
          <h2 className="font-medium text-sm md:text-base text-black">
            {handleCommitMessage()}
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
  commit: PropTypes.shape({
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    compareWithParent: PropTypes.shape({
      patchTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
    parent: PropTypes.shape({
      totals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    commitid: PropTypes.string,
    message: PropTypes.string,
    createdAt: PropTypes.string,
  }),
}

export default Title
