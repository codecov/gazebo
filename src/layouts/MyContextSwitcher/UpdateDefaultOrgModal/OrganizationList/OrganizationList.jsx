import cs from 'classnames'
import PropTypes from 'prop-types'

import Avatar from 'ui/Avatar'

import { useOrganizations } from './hooks'

function OrganizationList({ selectedOrgUsername, setSelectedOrgUsername }) {
  const data = useOrganizations()
  const organizations = data?.organizations
  const currentUser = data?.currentUser

  return (
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
  )
}

OrganizationList.propTypes = {
  selectedOrgUsername: PropTypes.string.isRequired,
  setSelectedOrgUsername: PropTypes.func.isRequired,
}

export default OrganizationList
