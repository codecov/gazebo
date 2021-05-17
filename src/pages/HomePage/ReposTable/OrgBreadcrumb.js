import Icon from 'ui/Icon'
import PropTypes from 'prop-types'

function OrgBreadcrumb({ repo }) {
  return (
    <div className="flex text-ds-gray-quinary items-center">
      {repo.private ? (
        <Icon
          size="sm"
          className="fill-current"
          variant="solid"
          name="lock-closed"
        />
      ) : (
        <Icon
          size="sm"
          className="fill-current"
          variant="solid"
          name="globe-alt"
        />
      )}
      <span className="ml-2.5 text-sm text-black">
        {repo.author.username} /{' '}
        <span className="font-semibold">{repo.name}</span>
      </span>
    </div>
  )
}

OrgBreadcrumb.propTypes = {
  repo: PropTypes.shape({
    private: PropTypes.bool.isRequired,
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    name: PropTypes.string,
  }),
}

export default OrgBreadcrumb
