import cs from 'classnames'
import PropTypes from 'prop-types'

import Avatar from 'ui/Avatar'
import Button from 'ui/Button'

import { useOrganizations } from './hooks'

function OrganizationList({ selectedOrgUsername, setSelectedOrgUsername }) {
  const data = useOrganizations()
  const organizations = data?.organizations
  const currentUser = data?.currentUser

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y border border-ds-gray-secondary text-ds-gray-octonary">
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
                  <span className="font-medium text-ds-gray-quaternary">
                    Current default org
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
      {data?.hasNextPage && (
        <div className="flex w-full justify-center">
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
  selectedOrgUsername: PropTypes.string.isRequired,
  setSelectedOrgUsername: PropTypes.func.isRequired,
}

export default OrganizationList
