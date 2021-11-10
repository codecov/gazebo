import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import Avatar from 'ui/Avatar'
import A from 'ui/A'
import PropTypes from 'prop-types'

const Title = ({ ownerData, pull }) => (
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

Title.propTypes = {
  ownerData: PropTypes.shape({
    avatarUrl: PropTypes.string,
    isCurrentUserPartOfOrg: PropTypes.bool,
    username: PropTypes.string,
  }),
  pull: PropTypes.shape({
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    compareWithBase: PropTypes.shape({
      patchTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    head: PropTypes.shape({
      totals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    pullId: PropTypes.number,
    state: PropTypes.string,
    title: PropTypes.string,
    updatestamp: PropTypes.string,
  }),
}

export default Title
