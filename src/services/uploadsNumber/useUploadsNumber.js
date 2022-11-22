import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchOwnerUploadsNumber({ provider, owner, signal }) {
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
    signal,
    variables: {
      owner,
    },
  }).then((res) => {
    const { numberOfUploads } = res?.data?.owner
    return numberOfUploads
  })
}

export function useUploadsNumber({ provider, owner }) {
  return useQuery(['ownerUploads', provider, owner], ({ signal }) =>
    fetchOwnerUploadsNumber({ provider, owner, signal })
  )
}
