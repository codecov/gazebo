import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'
import { transformStringToLocalStorageKey } from 'shared/utils/transformStringToLocalStorageKey'
import Icon from 'ui/Icon'
import Label from 'ui/Label'

const getRepoIconName = ({ activated, isRepoPrivate, active }) =>
  !activated && active ? 'ban' : isRepoPrivate ? 'lock-closed' : 'globe-alt'

function RepoTitleLink({
  repo,
  showRepoOwner,
  pageName,
  disabledLink,
  isRecentlyVisited,
}) {
  const options = {
    owner: repo.author.username,
    repo: repo.name,
  }

  const { private: isRepoPrivate, activated, active } = repo

  if (disabledLink) {
    return (
      <div className="flex items-center">
        <div className="flex cursor-default items-center text-ds-gray-quinary">
          <Icon
            size="sm"
            variant="solid"
            name={getRepoIconName({ activated, isRepoPrivate, active })}
          />
          <span className="ml-2.5 text-sm text-ds-secondary-text">
            {showRepoOwner && `${repo?.author?.username} / `}
            <span className="font-semibold">{repo.name}</span>
          </span>
        </div>
        {isRepoPrivate && (
          <Label variant="plain" className="ml-2">
            Private
          </Label>
        )}
        {active && !activated && (
          <Label variant="plain" className="ml-2">
            Deactivated
          </Label>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <AppLink
        pageName={pageName}
        options={options}
        className="flex items-center text-ds-gray-quinary hover:underline"
        onClick={() => {
          if (repo?.name && repo?.author?.username && repo?.active) {
            const key = transformStringToLocalStorageKey(repo.author.username)
            localStorage.setItem(`${key}_recently_visited`, repo.name)
          }
        }}
      >
        <Icon
          size="sm"
          variant="solid"
          name={getRepoIconName({ activated, isRepoPrivate, active })}
        />
        <span className="ml-2.5 mr-1.5 text-sm text-ds-secondary-text">
          {showRepoOwner && `${repo?.author?.username} / `}
          <span className="font-semibold">{repo.name}</span>
        </span>
      </AppLink>
      {isRepoPrivate && (
        <Label variant="plain" className="ml-2">
          Private
        </Label>
      )}
      {active && !activated && (
        <Label variant="plain" className="ml-2">
          Deactivated
        </Label>
      )}
      {repo?.isDemo && (
        <Label variant="plain" className="ml-2">
          System generated
        </Label>
      )}
      {isRecentlyVisited && (
        <Label variant="plain" className="ml-2">
          recently visited
        </Label>
      )}
    </div>
  )
}

RepoTitleLink.propTypes = {
  repo: PropTypes.shape({
    private: PropTypes.bool.isRequired,
    activated: PropTypes.bool,
    active: PropTypes.bool.isRequired,
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    name: PropTypes.string,
    isDemo: PropTypes.bool,
  }),
  showRepoOwner: PropTypes.bool.isRequired,
  pageName: PropTypes.string.isRequired,
  disabledLink: PropTypes.bool.isRequired,
  isRecentlyVisited: PropTypes.bool,
}

export default RepoTitleLink
