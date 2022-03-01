import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Avatar from 'ui/Avatar'
import A from 'ui/A'
import PropTypes from 'prop-types'
import { defaultAuthor } from 'shared/defaults'

const Title = ({ author, pullId, title, updatestamp }) => {
  const user = {
    avatarUrl: author?.avatarUrl || defaultAuthor.avatarUrl,
    username: author?.username || defaultAuthor.username,
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
              {' opened ' +
                formatDistanceToNow(new Date(updatestamp), {
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
    avatarUrl: PropTypes.string,
  }),
  pullId: PropTypes.number,
  title: PropTypes.string,
  updatestamp: PropTypes.string,
}

export default Title
