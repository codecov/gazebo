import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Avatar from 'ui/Avatar'
import A from 'ui/A'
import PropTypes from 'prop-types'
import { useOwner } from 'services/user'
import { PullRequestType } from '../../types'

const Title = ({ pull }) => {
  const { data: ownerData } = useOwner({ username: pull?.author?.username })

  return (
    <div className="flex flex-row">
      <span className="flex items-center mr-6">
        {ownerData && <Avatar user={ownerData} bordered />}
      </span>
      <div className="flex flex-col">
        <A to={{ pageName: 'pull', options: { pullid: pull?.pullId } }}>
          <h2 className="font-medium text-sm md:text-base text-black">
            {pull?.title}
          </h2>
        </A>
        <p className="text-xs">
          <A to={{ pageName: 'owner' }}>
            <span className="text-black">{pull?.author?.username}</span>
          </A>
          {pull?.updatestamp && (
            <span className="text-ds-gray-quinary">
              {' opened ' +
                formatDistanceToNow(new Date(pull?.updatestamp), {
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
  pull: PropTypes.shape(PullRequestType),
}

export default Title
