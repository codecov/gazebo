import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranches } from 'services/branches/useBranches'
import { useUpdateRepo } from 'services/repo'
import { useAddNotification } from 'services/toastNotification/context'
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
  const [branchesSearchTerm, setBranchesSearchTerm] = useState()
  const { provider, owner, repo } = useParams()

  const {
    data: branchesData,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useBranches({
    provider,
    owner,
    repo,
    filters: { searchValue: branchesSearchTerm },
    opts: { suspense: false },
  })

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
          <h2 className="flex gap-1 font-semibold">
            <Icon name="branch" variant="developer" size="sm" />
            Branch Context
          </h2>
          <div className="grid grid-cols-2">
            <Select
              dataMarketing="branch-selector-config-tab"
              ariaName="Branch selector"
              variant="gray"
              items={branchesNames}
              isLoading={isFetching}
              onChange={(branch) => {
                updateDefaultBranch(branch)
              }}
              onLoadMore={() => hasNextPage && fetchNextPage()}
              value={branch}
              onSearch={(term) => setBranchesSearchTerm(term)}
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
