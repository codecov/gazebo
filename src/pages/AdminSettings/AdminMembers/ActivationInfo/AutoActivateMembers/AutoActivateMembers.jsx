import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useSelfHostedSettings } from 'services/selfHosted'
import Api from 'shared/api'
import Spinner from 'ui/Spinner'
import Toggle from 'ui/Toggle'

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function AutoActivateMembers() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useSelfHostedSettings()
  const mutation = useMutation(
    (body) => {
      return Api.patch({ path: '/settings', body })
    },
    {
      useErrorBoundary: true,
      onSuccess: () => {
        queryClient.invalidateQueries(['SelfHostedSettings'])
      },
    }
  )

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="flex flex-col p-4 gap-2 border-2 border-ds-gray-primary mt-4">
      <div className="flex flex-row gap-2 items-center">
        <h3 className="font-semibold">Auto-activate members: </h3>
        <Toggle
          dataMarketing="auto-acitvate-members"
          label={data?.planAutoActivate ? 'On' : 'Off'}
          value={data?.planAutoActivate}
          onClick={() =>
            mutation.mutate({ planAutoActivate: !data?.planAutoActivate })
          }
        />
      </div>
      <p>
        Users will automatically be assigned a Codecov seat if they 1) author a
        pull request on a private repo, or 2) log in to a private repo and if
        there are seats available in the subscription.
      </p>
    </div>
  )
}

export default AutoActivateMembers
