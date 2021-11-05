import Button from 'ui/Button'
import A from 'ui/A'
import img404 from 'assets/svg/error-404.svg'

function LoginErrorHandler() {
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
      <h1 className="font-semibold text-3xl mt-4">404 error</h1>
      <p className="my-2">We can&apos;t find what you&apos;re looking for</p>
      <hr className="w-3/12 border-b border-gray-200 mt-6" />
      <h2 className="font-semibold text-base my-6">
        Create a culture of coverage with Codecov.
      </h2>
      <Button variant="primary" to={{ pageName: 'signUp' }}>
        Sign up
      </Button>
      <p className="my-6 text-xs">
        Already have an account? <A to={{ pageName: 'signIn' }}>Log in</A>.
      </p>
      <hr className="w-3/12 border-b border-gray-200" />
    </div>
  )
}

export default LoginErrorHandler
