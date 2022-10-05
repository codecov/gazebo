import { useQuery } from '@tanstack/react-query'

import { useUploadsNumber } from './useUploadsNumber'

function fetchIsUploadsNumberExceeded({ numberOfUploads = 0 }) {
  const maxUploadsNumber = 250
  const isUploadsNumberExceeded = numberOfUploads >= maxUploadsNumber
  return isUploadsNumberExceeded
}

export function useIsUploadsNumberExceeded({ provider, owner }) {
  const { data: numberOfUploads } = useUploadsNumber({ provider, owner })

  return useQuery(['uploadsExceeded', provider, owner], () => {
    return fetchIsUploadsNumberExceeded({ numberOfUploads })
  })
}
