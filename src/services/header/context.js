import { createContext } from 'react'

const testUrl =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

const navigation = {
  main: [
    { label: 'github', to: '/gh', iconName: 'infoCircle' },
    { label: 'codecov', to: '/gh/codecov', imageUrl: testUrl },
    { label: 'gazebo', to: '/gh/codecov/gazebo', imageUrl: testUrl },
  ],
  user: [
    { label: 'Organizations', to: '/account/gh/codecov', iconName: 'building' },
    {
      label: 'Codecov Settings',
      to: '/account/gh/codecov',
      imageUrl: testUrl,
    },
    {
      label: 'Personal Settings',
      to: '/account/gh/TerrySmithDC',
      imageUrl: testUrl,
    },
    { label: 'Sign Out', to: '/sign-out', iconName: 'signOut' },
  ],
}

export const NavigationContext = createContext(navigation)

export function NavigationProvider({ children }) {
  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  )
}
