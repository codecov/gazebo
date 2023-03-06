import { useContext } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { ActiveContext } from 'shared/context'
import A from 'ui/A'
import Button from 'ui/Button'

import { repoDisplayOptions } from '../ListRepo'

const NoReposBlock = () => {
  const repoDisplay = useContext(ActiveContext)
  const { provider, owner } = useParams()
  const history = useHistory()

  return repoDisplay !== repoDisplayOptions.INACTIVE.text ? (
    <div className="mx-4 mt-8 text-center">
      <h1 className="text-3xl font-semibold">No repos setup yet</h1>
      <div className="my-6 flex justify-center gap-1 text-base font-light">
        <p
          className="cursor-pointer font-sans text-ds-blue hover:underline focus:ring-2"
          onClick={() =>
            history.push(`/${provider}/${owner}?repoDisplay=Inactive`)
          }
        >
          Select the repo
        </p>
        you&#39;d like to setup and learn about setup with our{' '}
        <A to={{ pageName: 'docs' }}>quick start guide.</A>
      </div>
      <div className="m-auto w-52">
        <Button
          hook="no-repos-block"
          variant="primary"
          onClick={() =>
            history.push(`/${provider}/${owner}?repoDisplay=Inactive`)
          }
        >
          View repos for setup
        </Button>
      </div>
    </div>
  ) : (
    <div className="text-sm">You need to create repos first</div>
  )
}

export default NoReposBlock
