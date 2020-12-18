import PropTypes from 'prop-types'
import { format } from 'date-fns'

import User from 'ui/User'

import { getOwnerImg } from 'shared/utils'

function createUserPills({ student, is_admin, email, latest_private_pr_date }) {
  const pills = []

  if (student) pills.push({ text: 'Student' })
  if (is_admin) pills.push({ text: 'Admin', highlight: true })
  if (email) pills.push({ text: email })
  if (latest_private_pr_date) pills.push({ text: 'PR Author', highlight: true })

  return pills
}

function UserTable({ provider, users, Cta }) {
  return (
    <div className="flex py-6">
      <table className="w-full">
        <thead>
          <tr className="sr-only">
            <th>Users</th>
            <th>Last Pr</th>
            <th>Last Seen</th>
            <th>Activate/Deactivate seat</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user, i) => (
            <tr key={i}>
              <td>
                <User
                  username={user.username}
                  name={user.name}
                  avatarUrl={getOwnerImg(provider, user.username)}
                  pills={createUserPills(user)}
                />
              </td>
              <td>
                {user?.latest_private_pr_date &&
                  `Last PR: ${format(
                    new Date(user.latest_private_pr_date),
                    'MM/dd/yyyyy'
                  )}`}
              </td>
              <td>
                {user?.lastseen &&
                  `Last Seen: ${format(
                    new Date(user.lastseen),
                    'MM/dd/yyyyy'
                  )}`}
              </td>
              <td className="flex justify-end">{Cta(user)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

UserTable.propTypes = {
  provider: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      activated: PropTypes.bool,
      is_admin: PropTypes.bool,
      username: PropTypes.string,
      email: PropTypes.string,
      ownerid: PropTypes.number,
      student: PropTypes.bool,
      name: PropTypes.string,
      latest_private_pr_date: PropTypes.string, // Date
      lastseen: PropTypes.string, // Date
    })
  ).isRequired,
  Cta: PropTypes.func.isRequired,
}

export default UserTable
