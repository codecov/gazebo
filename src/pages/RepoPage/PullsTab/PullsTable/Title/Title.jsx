import PropTypes from 'prop-types'

import { ComparisonReturnType } from 'shared/utils/comparison'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Avatar, { DefaultAuthor } from 'ui/Avatar'

const Title = ({ author, pullId, title, updatestamp, compareWithBaseType }) => {
  const user = {
    avatarUrl: author?.avatarUrl || DefaultAuthor.AVATAR_URL,
    username: author?.username || DefaultAuthor.USERNAME,
  }
  const pageName =
    compareWithBaseType === ComparisonReturnType.FIRST_PULL_REQUEST
      ? 'pullTreeView'
      : 'pullDetail'

  return (
    <div className="flex w-96 flex-row lg:w-auto">
      <span className="mr-5 flex items-center">
        <Avatar user={user} bordered />
      </span>
      <div className="flex w-5/6 flex-col lg:w-auto">
        <A
          to={{
            pageName,
            options: { pullId },
          }}
        >
          <h2 className="text-sm font-semibold text-black">{title}</h2>
        </A>
        <p className="text-xs">
          <A to={{ pageName: 'owner' }}>
            <span className="text-black">{author?.username}</span>
          </A>
          {updatestamp && (
            <span className="text-ds-gray-quinary">
              {' '}
              last updated {formatTimeToNow(updatestamp)}
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
  pullId: PropTypes.number,
  title: PropTypes.string,
  updatestamp: PropTypes.string,
  compareWithBaseType: PropTypes.string,
}

export default Title
