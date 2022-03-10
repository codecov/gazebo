import { useQuery } from 'react-query'

import Api from 'shared/api'

function fetchOwnerUploadsNumber({ provider, owner }) {
  const query = `
    query GetUploadsNumber($owner: String!){
        owner(username:$owner){
          numberOfUploads
        } 
     } 
   `

  return Api.graphql({
    provider,
    query,
    variables: {
      owner,
    },
  }).then((res) => {
    const { numberOfUploads } = res?.data?.owner
    return numberOfUploads
  })
}

function fetchIsUploadsNumberExceeded({ numberOfUploads = 0 }) {
  const maxUploadsNumber = 250
  const isUploadsNumberExceeded = numberOfUploads >= maxUploadsNumber
  return isUploadsNumberExceeded
}

export function useUploadsNumber({ provider, owner }) {
  return useQuery([provider, owner, 'ownerUploads'], () => {
    return fetchOwnerUploadsNumber({ provider, owner })
  })
}

export function useIsUploadsNumberExceeded({ provider, owner }) {
  const { data: numberOfUploads } = useUploadsNumber({ provider, owner })

  return useQuery([provider, owner, 'uploadsExceeded'], () => {
    return fetchIsUploadsNumberExceeded({ numberOfUploads })
  })
}
