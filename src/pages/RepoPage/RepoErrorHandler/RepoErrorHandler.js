import { useResyncUser } from 'services/user'
import Spinner from 'ui/Spinner'
import { useNavLinks } from 'services/navigation'
import { Fragment } from 'react'
import img404 from 'assets/svg/error-404.svg'
import { useUser } from 'services/user'

function RepoErrorHandler() {
  const { data: currentUser } = useUser({
    suspense: false,
  })

  const isPrivateAccess = currentUser?.privateAccess
  const { triggerResync, isSyncing } = useResyncUser()
  const { signIn } = useNavLinks()
  const { illustration } = {
    illustration: img404,
  }

  return (
    <div className="flex items-center flex-col mt-40">
      <img
        alt="illustration error"
        width="154px"
        height="192px"
        src={illustration}
      />
      {!isSyncing ? (
        <Fragment>
          <h1 className="font-semibold text-3xl my-4">404 error</h1>
          <p>We can&apos;t find what you&apos;re looking for</p>
          <p>
            {' '}
            If it&apos;s a private repo you may need to{' '}
            <button className="text-ds-blue" onClick={triggerResync}>
              re-sync
            </button>
            {isPrivateAccess ? (
              '.'
            ) : (
              <span>
                {' '}
                or{' '}
                <a className="text-ds-blue" href={`${signIn.path()}?private=t`}>
                  add private scope
                </a>
                .
              </span>
            )}
          </p>
        </Fragment>
      ) : (
        <Fragment>
          <div className="mr-2 text-ds-blue">
            <Spinner />
          </div>
          Syncing...
        </Fragment>
      )}
    </div>
  )
}

export default RepoErrorHandler
