import { useState, useLayoutEffect } from 'react'
import { useParams } from 'react-router'

import { useCommits } from 'services/commits'
import { useBranches } from 'services/branches'
import { useRepo } from 'services/repo'
import { useLocationParams } from 'services/navigation'

import Checkbox from 'ui/Checkbox'
import Select from 'ui/Select'
import Icon from 'ui/Icon'

import CommitsTable from './CommitsTable'
import { useSetCrumbs } from '../context'

const useParamsFilters = (repoData) => {
  const defaultParams = {
    branch: repoData?.repository?.defaultBranch,
    hideFailedCI: false,
  }
  const { params, updateParams } = useLocationParams(defaultParams)
  const paramCIStatus = params.hideFailedCI && true

  const [branchName, setBranch] = useState(params.branch)
  const [hideFailedCI, setHideFailedCI] = useState(paramCIStatus)

  return { branchName, hideFailedCI, setBranch, setHideFailedCI, updateParams }
}

function CommitsTab() {
  const setCrumbs = useSetCrumbs()
  const { provider, owner, repo } = useParams()

  const { data: branches } = useBranches({ provider, owner, repo })
  const { data: repoData } = useRepo({ provider, owner, repo })
  const branchesNames = branches?.map((branch) => branch.name) || []

  const { branchName, hideFailedCI, setBranch, setHideFailedCI, updateParams } =
    useParamsFilters(repoData)

  const { data: commits } = useCommits({
    provider,
    owner,
    repo,
    filters: {
      hideFailedCI,
      branchName,
    },
  })

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: '',
        readOnly: true,
        children: (
          <span className="flex items-center gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            {branchName}
          </span>
        ),
      },
    ])
  }, [branchName, setCrumbs])

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex gap-2 justify-between px-2 sm:px-0">
        <div className="flex gap-1 flex-col">
          <h2 className="font-semibold flex gap-1 flex-initial">
            <span>
              <Icon name="branch" variant="developer" size="sm" />
            </span>
            Branch Context
          </h2>
          <div>
            <Select
              className="bg-ds-gray-primary"
              items={branchesNames}
              onChange={(branch) => {
                setBranch(branch)
                updateParams({ branch })
              }}
              value={branchName}
            />
          </div>
        </div>

        <Checkbox
          label="Hide commits with failed CI"
          name="filter commits"
          onChange={(e) => {
            const { checked } = e.target
            setHideFailedCI(checked)
            updateParams({ hideFailedCI: checked })
          }}
          checked={hideFailedCI}
        />
      </div>
      <CommitsTable commits={commits} />
    </div>
  )
}

export default CommitsTab
