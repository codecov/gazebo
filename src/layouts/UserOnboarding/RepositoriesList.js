import PropTypes from 'prop-types'
import { useState } from 'react'
import useDebounce from 'react-use/lib/useDebounce'

import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import List from 'ui/List'
import Spinner from 'ui/Spinner'
import TextInput from 'ui/TextInput'

import { useRepos } from '../../services/repos'

const getListItems = ({ repos }) =>
  repos.map((repo) => ({
    name: repo.name,
    value: (
      <div className="flex items-center" data-testid={`${repo.name}-container`}>
        {repo.private ? (
          <Icon size="sm" variant="solid" name="lock-closed" />
        ) : (
          <Icon size="sm" variant="solid" name="globe-alt" />
        )}
        <span className="ml-2.5 text-sm text-black">
          <span className="font-semibold">{repo.name}</span>
        </span>
      </div>
    ),
  }))

function RepositoriesList({ organization, onSubmit }) {
  const [search, setSearch] = useState('')
  const [searchValue, setSearchValue] = useState('')

  useDebounce(
    () => {
      setSearchValue(search)
    },
    500,
    [search]
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useRepos({
      sortItem: {
        direction: 'DESC',
        ordering: 'COMMIT_DATE',
      },
      term: searchValue,
      owner: organization.username,
      suspense: false,
    })

  const handleRepoSelect = (repo) => {
    const selectedRepo = data.repos.find(({ name }) => name === repo)
    onSubmit(selectedRepo)
  }

  const loadingState = (
    <div className="flex justify-center py-8">
      <Spinner />
    </div>
  )

  return (
    <div className="h-full -mt-4">
      <div className="mr-2 pb-3">
        <div className="flex items-center pb-2">
          <Avatar user={organization} bordered />
          <div className="mx-2 text-xl font-semibold">
            {organization.username}
          </div>
        </div>
        <TextInput
          value={search}
          autoFocus
          placeholder="Search"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="border-t border-gray-200">
        {isLoading ? (
          loadingState
        ) : (
          <>
            <List
              items={getListItems({ repos: data.repos })}
              onItemSelect={handleRepoSelect}
              noBorder
            />
            {data?.repos?.length ? (
              hasNextPage && (
                <div className="w-full mt-4 flex justify-center">
                  <Button
                    hook="load-more"
                    variant="primary"
                    isLoading={isFetchingNextPage}
                    onClick={fetchNextPage}
                  >
                    Load More
                  </Button>
                </div>
              )
            ) : (
              <div className="text-sm py-4">
                {searchValue ? 'No results found' : 'No repos setup yet'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

RepositoriesList.propTypes = {
  organization: PropTypes.shape({
    username: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default RepositoriesList
