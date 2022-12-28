import PropTypes from 'prop-types'
import { useContext } from 'react'

import { useLocationParams } from 'services/navigation'
import { ActiveContext } from 'shared/context'
import A from 'ui/A'
import Button from 'ui/Button'

import { repoDisplayOptions } from '../ListRepo'

const NoReposBlock = ({ owner }) => {
  const repoDisplay = useContext(ActiveContext)
  const { updateParams } = useLocationParams()

  return repoDisplay !== repoDisplayOptions.INACTIVE.text ? (
    <div className="text-center mx-4 mt-8">
      <h1 className="font-semibold text-3xl">No repos setup yet</h1>
      <div className="text-base font-light my-6 flex justify-center gap-1">
        <p
          className="text-ds-blue font-sans cursor-pointer hover:underline focus:ring-2"
          onClick={() => updateParams({ repoDisplay: 'Inactive' })}
        >
          Select the repo
        </p>
        you&#39;d like to setup and learn about setup with our{' '}
        <A to={{ pageName: 'docs' }}>quick start guide.</A>
      </div>
      <div className="w-52 m-auto">
        <Button
          variant="primary"
          onClick={() => updateParams({ repoDisplay: 'Inactive' })}
        >
          View repos for setup
        </Button>
      </div>
    </div>
  ) : (
    <div className="text-sm">You need to create repos first</div>
  )
}

NoReposBlock.propTypes = {
  owner: PropTypes.string,
}

export default NoReposBlock
