import { useMutation, useQueryClient } from '@tanstack/react-query'
import PropTypes from 'prop-types'

import Api from 'shared/api'
import Toggle from 'ui/Toggle'

function AutoActivation({ autoActivate }) {
  const queryClient = useQueryClient()
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

  return (
    <div className="flex flex-col p-4 gap-2 border-2 border-ds-gray-primary mt-4">
      <div className="flex flex-row gap-2 items-center">
        <h3 className="font-semibold">Auto-activate members: </h3>
        <Toggle
          label={autoActivate ? 'On' : 'Off'}
          value={autoActivate}
          onClick={() => mutation.mutate({ planAutoActivate: !autoActivate })}
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

AutoActivation.propTypes = {
  autoActivate: PropTypes.bool,
}

export default AutoActivation
