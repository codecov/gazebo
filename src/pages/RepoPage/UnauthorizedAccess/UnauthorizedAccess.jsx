import img403 from 'assets/errors/error-403.svg'
import A from 'ui/A'

const UnauthorizedAccess = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <img alt="illustration error" src={img403} width="200px" />
      <h1 className="text-2xl">Unauthorized Access</h1>
      <div className="flex flex-col items-center justify-center gap-4">
        <p>
          Activation is required to view this repo, please{' '}
          <A to={{ pageName: 'membersTab' }}>click here </A> to activate your
          account.
        </p>
        <strong>Error 403</strong>
      </div>
    </div>
  )
}

export default UnauthorizedAccess
