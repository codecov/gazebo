import { useUpdateSelfHostedSettings } from 'services/account/useUpdateSelfHostedSettings'
import { useSelfHostedSettings } from 'services/selfHosted'
import Spinner from 'ui/Spinner'
import Toggle from 'ui/Toggle'

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function AutoActivateMembers() {
  const { data, isLoading } = useSelfHostedSettings()

  const { mutate, isLoading: isMutating } = useUpdateSelfHostedSettings()
  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="mt-4 flex flex-col gap-2 border-2 border-ds-gray-primary p-4">
      <div className="flex flex-row items-center gap-2">
        <h3 className="font-semibold">Auto-activate members: </h3>
        <Toggle
          dataMarketing="auto-acitvate-members"
          label={data?.planAutoActivate ? 'On' : 'Off'}
          value={data?.planAutoActivate}
          disabled={isMutating}
          onClick={() =>
            mutate({ shouldAutoActivate: !data?.planAutoActivate })
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
