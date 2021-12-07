import Api from 'shared/api'
import { useQuery } from 'react-query'

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

export function useUploadsNumber({ provider, owner }) {
  return useQuery([provider, owner], () => {
    return fetchOwnerUploadsNumber({ provider, owner })
  })
}
