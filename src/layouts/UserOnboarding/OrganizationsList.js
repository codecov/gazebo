import PropTypes from 'prop-types'

import { useMyContexts } from 'services/user'
import A from 'ui/A'
import Avatar from 'ui/Avatar'
import Icon from 'ui/Icon'
import List from 'ui/List'

const getListItems = ({ organizations }) =>
  organizations.map((org) => ({
    name: org.username,
    value: (
      <div className="flex items-center py-2">
        <Avatar user={org} bordered />
        <div className="mx-2 text-base">{org.username}</div>
      </div>
    ),
  }))

function OrganizationsList({
  onSubmit,
  isHelpFindingOrg,
  setIsHelpFindingOrg,
}) {
  const { data: myContexts, refetch } = useMyContexts()

  const { currentUser, myOrganizations } = myContexts

  const organizations = [
    {
      ...currentUser,
    },
    ...myOrganizations.map((context) => ({
      ...context,
    })),
  ]

  const handleOrganizationSelect = (orgName) => {
    localStorage.setItem('gz-defaultOrganization', JSON.stringify(orgName))
    const selectedOrg = organizations.find(
      ({ username }) => orgName === username
    )
    onSubmit(selectedOrg)
  }

  return (
    <div className="h-80">
      {isHelpFindingOrg ? (
        <div className="text-base w-[30rem]">
          <h2 className="font-semibold pb-2"> Enable org access</h2>
          <p>
            GitHub requires{' '}
            <A to={{ pageName: 'oauthEnabling' }}>
              approval for third party access
            </A>{' '}
            at the organizational level in{' '}
            <A to={{ pageName: 'userAppManagePage' }}>access settings</A>.
          </p>
          <ul className="pt-2 pl-8 list-disc">
            <li>
              <span className="font-semibold">If you are an admin</span>, you
              may grant access by selecting the “grant” button in{' '}
              <A to={{ pageName: 'userAppManagePage' }}>access settings</A>.
              Once you’ve done this, then{' '}
              <button
                className="align-bottom inline-flex items-center text-ds-blue"
                onClick={() => {
                  refetch().then(() => setIsHelpFindingOrg(false))
                }}
              >
                <Icon name="refresh" size="sm" variant="solid" />
                refresh list
              </button>
            </li>
            <li>
              <span className="font-semibold">If you are non-admin,</span> you
              can select the “request” button in{' '}
              <A to={{ pageName: 'userAppManagePage' }}>access settings</A> and
              a message will be sent to the admin of your organization.
            </li>
          </ul>
        </div>
      ) : (
        <List
          items={getListItems({ organizations })}
          onItemSelect={handleOrganizationSelect}
        />
      )}
    </div>
  )
}

OrganizationsList.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isHelpFindingOrg: PropTypes.bool,
  setIsHelpFindingOrg: PropTypes.func.isRequired,
}

export default OrganizationsList
