import PropTypes from 'prop-types'
import { useMemo } from 'react'

import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Avatar, { DefaultAuthor } from 'ui/Avatar'

const Title = ({ author, pullId, title, updatestamp }) => {
  const formattedDate = useMemo(
    () => formatTimeToNow(updatestamp),
    [updatestamp]
  )
  const user = {
    avatarUrl: author?.avatarUrl || DefaultAuthor.AVATAR_URL,
    username: author?.username || DefaultAuthor.USERNAME,
  }

  return (
    <div className="flex flex-row w-96 lg:w-auto">
      <span className="flex items-center mr-5">
        <Avatar user={user} bordered />
      </span>
      <div className="flex flex-col w-5/6 lg:w-auto">
        <A to={{ pageName: 'pull', options: { pullid: pullId } }}>
          <h2 className="font-medium text-sm md:text-base text-black">
            {title}
          </h2>
        </A>
        <p className="text-xs">
          <A to={{ pageName: 'owner' }}>
            <span className="text-black">{author?.username}</span>
          </A>
          {updatestamp && (
            <span className="text-ds-gray-quinary">
              {' '}
              opened {formattedDate}
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
}

export default Title
