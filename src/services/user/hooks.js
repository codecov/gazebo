import { useState } from 'react'

const username = 'TerrySmithDC'
const avatarUrl =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

/*
  Valid user state shape:

  {
    username: 'Link',
    avatarUrl: 'https://hyru.le/beachday.png'
  }

*/

export function useUser() {
  // TODO Setup API
  const [privateUser, setPrivateUser] = useState({ username, avatarUrl })

  // Throws error if invalid user object attempted
  function updateUser({ username, avatarUrl, ...invalidKeys }) {
    for (const [key, value] of Object.entries(invalidKeys)) {
      console.warn(
        `Error updating user service: ${key} with the value of ${value} is not a valid user property`
      )
    }

    setPrivateUser(
      Object.assign(
        privateUser,
        username && { username },
        avatarUrl && { avatarUrl }
      )
    )
  }

  return [privateUser, updateUser]
}
