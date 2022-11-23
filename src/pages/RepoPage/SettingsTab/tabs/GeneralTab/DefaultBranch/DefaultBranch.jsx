import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useUpdateRepo } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'
import Icon from 'ui/Icon'
import Select from 'ui/Select'
import SettingsDescriptor from 'ui/SettingsDescriptor'

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
            text: 'We were unable to update the default branch for this repo',
          }),
      }
    )
  }

  return { updateDefaultBranch, ...rest }
}

function DefaultBranch({ defaultBranch }) {
  const { provider, owner, repo } = useParams()

  const {
    data: branchesData,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useBranches({ provider, owner, repo })
  const branchesNames =
    branchesData?.branches?.map((branch) => branch.name) || []
  const { updateDefaultBranch, data } = useUpdateDefaultBranch()

  const branch = data?.branch || defaultBranch

  return (
    <SettingsDescriptor
      title="Default Branch"
      description="Selection for branch context of data in coverage dashboard"
      content={
        <>
          <h2 className="font-semibold flex gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            Branch Context
          </h2>
          <div className="grid grid-cols-2">
            <Select
              dataMarketing="branch-selector-settings-tab"
              ariaName="Branch selector"
              variant="gray"
              items={branchesNames}
              isLoading={isFetching}
              onChange={(branch) => {
                updateDefaultBranch(branch)
              }}
              onLoadMore={() => hasNextPage && fetchNextPage()}
              value={branch}
            />
          </div>
        </>
      }
    />
  )
}

DefaultBranch.propTypes = {
  defaultBranch: PropTypes.string.isRequired,
}

export default DefaultBranch
