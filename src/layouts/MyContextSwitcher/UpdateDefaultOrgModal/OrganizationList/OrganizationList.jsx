import cs from 'classnames'
import isNil from 'lodash/isNil'
import PropTypes from 'prop-types'

import Avatar from 'ui/Avatar'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import { useOrganizations } from './hooks'

function OrganizationList({ selectedOrgUsername, setSelectedOrgUsername }) {
  const data = useOrganizations()
  const organizations = data?.organizations
  const currentUser = data?.currentUser
  const defaultOrg = data?.defaultOrg

  return (
    <div className="flex flex-col gap-4">
      <button
        className={cs(
          'flex items-center gap-3 border border-ds-gray-secondary p-4 hover:bg-ds-gray-primary transition duration-150 cursor-pointer',
          {
            'hover:bg-ds-blue-selected bg-ds-blue-selected':
              isNil(selectedOrgUsername),
          }
        )}
        onClick={() => setSelectedOrgUsername(null)}
      >
        <Icon name="home" />
        All orgs and repos
        {!defaultOrg && (
          <span className="text-ds-gray-quaternary font-medium">
            Current default org
          </span>
        )}
      </button>
      <ul className="text-ds-gray-octonary divide-y border border-ds-gray-secondary">
        {organizations?.map((organization) => {
          const currentOrgUsername = organization?.username
          return (
            <li
              key={currentOrgUsername}
              className={cs(
                'flex p-4 hover:bg-ds-gray-primary transition duration-150 cursor-pointer',
                {
                  'hover:bg-ds-blue-selected bg-ds-blue-selected':
                    currentOrgUsername === selectedOrgUsername,
                }
              )}
              onClick={() => setSelectedOrgUsername(currentOrgUsername)}
            >
              <button className="flex items-center gap-3">
                <Avatar user={organization} bordered />
                <span>{currentOrgUsername}</span>
                {currentOrgUsername === currentUser?.defaultOrgUsername && (
                  <span className="text-ds-gray-quaternary font-medium">
                    Current default org
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
      {data?.hasNextPage && (
        <div className="w-full flex justify-center">
          <Button
            hook="load-more"
            isLoading={data?.isFetching}
            onClick={() => data?.fetchNextPage()}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

OrganizationList.propTypes = {
  selectedOrgUsername: PropTypes.string,
  setSelectedOrgUsername: PropTypes.func.isRequired,
}

export default OrganizationList
