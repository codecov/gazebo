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
    <div className="text-center mx-4 mt-8">
      <h1 className="font-semibold text-3xl">No repos setup yet</h1>
      <div className="text-base font-light my-6 flex justify-center gap-1">
        <p
          className="text-ds-blue font-sans cursor-pointer hover:underline focus:ring-2"
          onClick={() =>
            history.push(`/${provider}/${owner}?repoDisplay=Inactive`)
          }
        >
          Select the repo
        </p>
        you&#39;d like to setup and learn about setup with our{' '}
        <A to={{ pageName: 'docs' }}>quick start guide.</A>
      </div>
      <div className="w-52 m-auto">
        <Button
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
