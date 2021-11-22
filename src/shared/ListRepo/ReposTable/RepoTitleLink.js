import Icon from 'ui/Icon'
import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

function RepoTitleLink({ repo, showRepoOwner, active, newRepoSetupLink }) {
  const options = {
    owner: repo.author.username,
    repo: repo.name,
  }

  const handlePageName = () => {
    return active ? 'repo' : newRepoSetupLink ? 'new' : 'repo'
  }

  return (
    <div className="flex items-center">
      <AppLink
        pageName={handlePageName()}
        options={options}
        className="flex text-ds-gray-quinary items-center hover:underline"
      >
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
          {showRepoOwner && `${repo.author.username} / `}
          <span className="font-semibold">{repo.name}</span>
        </span>
      </AppLink>
      {repo.private && (
        <span className="ml-2 px-1 py-0.5 border border-ds-gray-tertiary rounded text-xs text-ds-gray-senary">
          Private
        </span>
      )}
    </div>
  )
}

RepoTitleLink.propTypes = {
  repo: PropTypes.shape({
    private: PropTypes.bool.isRequired,
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    name: PropTypes.string,
  }),
  showRepoOwner: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  newRepoSetupLink: PropTypes.bool.isRequired,
}

export default RepoTitleLink
