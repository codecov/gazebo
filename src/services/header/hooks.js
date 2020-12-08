import { useState } from 'react'

const main = [
  { label: 'github', to: '/gh', iconName: 'infoCircle' },
  {
    label: 'codecov',
    to: '/gh/codecov',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    label: 'gazebo',
    to: '/gh/codecov/gazebo',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]
const subMenu = [
  { label: 'Organizations', to: '/account/gh/codecov', iconName: 'building' },
  {
    label: 'Codecov Settings',
    to: '/account/gh/codecov',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    label: 'Personal Settings',
    to: '/account/gh/TerrySmithDC',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  { label: 'Sign Out', to: '/sign-out', iconName: 'signOut' },
]

export function useMainNav() {
  return useState(main)
}

export function useSubNav() {
  return useState(subMenu)
}
