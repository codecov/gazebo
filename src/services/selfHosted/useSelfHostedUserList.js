import { useInfiniteQuery } from '@tanstack/react-query'

import Api from 'shared/api'

// eslint-disable-next-line max-statements, complexity
export const generatePath = ({ activated, search, isAdmin }) => {
  let path = '/users'
  let paramSet = false

  if (typeof activated !== 'undefined') {
    path = `${path}?activated=${activated}`
    paramSet = true
  }

  if (typeof isAdmin !== 'undefined') {
    if (paramSet) {
      path = `${path}&is_admin=${isAdmin}`
    } else {
      path = `${path}?is_admin=${isAdmin}`
      paramSet = true
    }
  }

  if (search !== '') {
    if (paramSet) {
      path = `${path}&search=${search}`
    } else {
      path = `${path}?search=${search}`
      paramSet = true
    }
  }

  return path
}

export const useSelfHostedUserList = ({ activated, search, isAdmin }) =>
  useInfiniteQuery(
    ['SelfHostedUserList', activated, search, isAdmin],
    ({ pageParam = 1 }) => {
      let path = generatePath({ activated, search, isAdmin })

      if (
        typeof activated !== 'undefined' ||
        search !== '' ||
        typeof isAdmin !== 'undefined'
      ) {
        path = `${path}&page=${pageParam}`
      } else {
        path = `${path}?page=${pageParam}`
      }

      return Api.get({ path })
    },
    {
      select: ({ pages }) => pages.map(({ results }) => results).flat(),
      getNextPageParam: (data) => {
        if (data?.next) {
          const { searchParams } = new URL(data.next)
          return searchParams.get('page')
        }
        return undefined
      },
    }
  )
