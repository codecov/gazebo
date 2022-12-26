import PropTypes from 'prop-types'
import { useContext } from 'react'

import { ActiveContext } from 'shared/context'
import A from 'ui/A'
import Button from 'ui/Button'

import { repoDisplayOptions } from '../ListRepo'

const NoReposBlock = ({ owner }) => {
  const repoDisplay = useContext(ActiveContext)

  return repoDisplay !== repoDisplayOptions.INACTIVE.text ? (
    <div className="text-center mx-4 mt-8">
      <h1 className="font-semibold text-3xl">No repos setup yet</h1>
      <p className="text-base font-light my-6">
        <A
          to={{
            pageName: owner ? 'ownerActiveRepos' : 'providerActiveRepos',
          }}
        >
          Select the repo
        </A>{' '}
        you&#39;d like to setup and learn about setup with our{' '}
        <A to={{ pageName: 'docs' }}>quick start guide.</A>
      </p>
      <div className="w-52 m-auto">
        <Button
          variant="primary"
          to={{ pageName: owner ? 'ownerActiveRepos' : 'providerActiveRepos' }}
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
