import flagManagement from 'assets/flagManagement.svg'
import A from 'ui/A'

function FlagsNotConfigured() {
  return (
    <div className="mt-2 flex flex-col items-center justify-center gap-2 text-base text-ds-gray-octonary">
      <div className="flex min-w-[60%] flex-col justify-center gap-2 text-center">
        <img
          alt="Flags feature not configured"
          className="mx-auto mb-8 w-screen"
          src={flagManagement}
        />
        <span className="font-semibold">
          The Flags feature is not yet configured{' '}
        </span>
        <span>
          Learn how flags can{' '}
          <A hook="flags" to={{ pageName: 'flags' }} isExternal>
            help your team today
          </A>
          .
        </span>
      </div>
    </div>
  )
}

export default FlagsNotConfigured
