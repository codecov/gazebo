import PropTypes from 'prop-types'
import A from 'ui/A'
import Button from 'ui/Button'

const NoReposBlock = ({ owner, active }) => {
  return active ? (
    <div className="text-center m-auto mt-8">
      <h1 className="font-semibold text-3xl">No repos setup yet</h1>
      <p className="text-base font-light my-6">
        <A to={{ pageName: owner ? 'ownerAddRepo' : 'providerAddRepo' }}>
          Select the repo
        </A>{' '}
        you&#39;d like to setup and learn about setup with our{' '}
        <A to={{ pageName: 'docs' }}>quick start guide.</A>
      </p>
      <div className="w-52 m-auto">
        <Button
          variant="primary"
          to={{ pageName: owner ? 'ownerAddRepo' : 'providerAddRepo' }}
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
  active: PropTypes.bool,
}

export default NoReposBlock
