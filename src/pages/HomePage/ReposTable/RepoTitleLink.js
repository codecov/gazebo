import Icon from 'ui/Icon'
import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

function RepoTitleLink({ repo, showRepoOwner }) {
  const options = {
    owner: repo.author.username,
    repo: repo.name,
  }

  return (
    <AppLink
      pageName="repo"
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
}

export default RepoTitleLink
