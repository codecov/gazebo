import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useUpdateRepo } from 'services/repoUpdate/hooks'
import { useAddNotification } from 'services/toastNotification'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

function useUpdateDefaultBranch({ provider, owner, repo }) {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpdateRepo({
    provider,
    owner,
    repo,
  })

  async function updateDefaultBranch(branch) {
    const body = { branch }
    mutate(body, {
      onError: () =>
        addToast({
          type: 'error',
          text: 'Something went wrong',
        }),
    })
  }

  return { updateDefaultBranch, ...rest }
}

function DefaultBranch({ defaultBranch }) {
  const { provider, owner, repo } = useParams()

  const { data: branches } = useBranches({ provider, owner, repo })
  const branchesNames = branches?.map((branch) => branch.name) || []
  const [branch, setBranch] = useState(defaultBranch)

  const { updateDefaultBranch } = useUpdateDefaultBranch({
    provider,
    owner,
    repo,
  })

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Default Branch</h1>
      <p className="mb-4">
        Selection for branch context of data in coverage dashboard
      </p>
      <hr />
      <div className="flex flex-col mt-4 border-2 border-gray-100 p-4 xl:w-4/5 2xl:w-3/5 gap-4">
        <h2 className="font-semibold flex gap-1">
          <Icon name="branch" variant="developer" size="sm" />
          Branch Context
        </h2>
        <div className="grid grid-cols-2">
          <Select
            variant="gray"
            items={branchesNames}
            onChange={async (branch) => {
              await updateDefaultBranch(branch)
              setBranch(branch)
            }}
            value={branch}
          />
        </div>
      </div>
    </div>
  )
}

DefaultBranch.propTypes = {
  defaultBranch: PropTypes.string.isRequired,
}

export default DefaultBranch
