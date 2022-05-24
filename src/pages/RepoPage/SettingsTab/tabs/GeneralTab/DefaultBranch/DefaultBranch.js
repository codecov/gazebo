import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useUpdateRepo } from 'services/repoUpdate'
import { useAddNotification } from 'services/toastNotification'
import Icon from 'ui/Icon'
import Select from 'ui/Select'

function useUpdateDefaultBranch() {
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpdateRepo()

  async function updateDefaultBranch(branch) {
    mutate(
      { branch },
      {
        onError: () =>
          addToast({
            type: 'error',
            text: 'Something went wrong',
          }),
      }
    )
  }

  return { updateDefaultBranch, ...rest }
}

function DefaultBranch({ defaultBranch }) {
  const { provider, owner, repo } = useParams()

  const { data: branches } = useBranches({ provider, owner, repo })
  const branchesNames = branches?.map((branch) => branch.name) || []
  const { updateDefaultBranch, data } = useUpdateDefaultBranch()

  const branch = data?.branch || defaultBranch

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">Default Branch</h1>
        <p>Selection for branch context of data in coverage dashboard</p>
        <hr />
      </div>
      <div className="flex flex-col border-2 border-gray-100 p-4 xl:w-4/5 2xl:w-3/5 gap-4">
        <h2 className="font-semibold flex gap-1">
          <Icon name="branch" variant="developer" size="sm" />
          Branch Context
        </h2>
        <div className="grid grid-cols-2">
          <Select
            variant="gray"
            items={branchesNames}
            onChange={(branch) => {
              updateDefaultBranch(branch)
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
