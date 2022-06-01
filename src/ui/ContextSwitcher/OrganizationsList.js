import PropTypes from 'prop-types'
import { useState } from 'react'

import { useMyContexts } from 'services/user'
import Avatar from 'ui/Avatar'
import Icon from 'ui/Icon'
import List from 'ui/List'

const getListItems = ({ organizations }) =>
  organizations.map((org) => ({
    name: org.username,
    value: (
      <div className="flex items-center py-2">
        {org.isAllOrgs ? <Icon name="home" /> : <Avatar user={org} bordered />}
        <div className="mx-2 text-base flex flex-1 justify-between">
          {org.username}{' '}
          {org.isDefault && (
            <span className="text-sm text-ds-gray-quinary">
              Current org view
            </span>
          )}
        </div>
      </div>
    ),
    selected: org.isSelected,
  }))

const unshiftOrg = ({ orgs, defaultOrg }) => [
  {
    ...orgs.find(({ username }) => username === defaultOrg),
    isDefault: true,
  },
  ...orgs.filter(({ username }) => username !== defaultOrg),
]

function OrganizationsList({ onSelect }) {
  const { data: myContexts } = useMyContexts()

  const [defaultOrg] = useState(
    JSON.parse(localStorage.getItem('gz-defaultOrganization'))
  )

  const { currentUser, myOrganizations } = myContexts

  const initOrgs = [
    { username: 'Show all orgs and repos', isAllOrgs: true },
    {
      ...currentUser,
    },
    ...myOrganizations.map((context) => ({
      ...context,
    })),
  ]

  const [organizations, setOrganizations] = useState(
    Boolean(defaultOrg) ? unshiftOrg({ orgs: initOrgs, defaultOrg }) : initOrgs
  )

  const handleOrganizationSelect = (orgName) => {
    setOrganizations((prevState) =>
      prevState.map((org) => ({
        ...org,
        isSelected: org.username === orgName,
      }))
    )
    onSelect(orgName)
  }

  return (
    <div className="h-80">
      <List
        items={getListItems({ organizations })}
        onItemSelect={handleOrganizationSelect}
      />
    </div>
  )
}

OrganizationsList.propTypes = {
  onSelect: PropTypes.func.isRequired,
}

export default OrganizationsList
