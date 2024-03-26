import componentManagement from 'assets/flagManagement.svg'
import A from 'ui/A'

function ComponentsNotConfigured() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-2 text-base text-ds-gray-octonary">
      <div className="flex min-w-[60%] flex-col justify-center gap-2 text-center">
        <img
          alt="Components feature not configured"
          className="mx-auto mb-8 w-screen"
          src={componentManagement}
        />
        <span className="font-semibold">
          The Components feature is not yet configured{' '}
        </span>
        <span>
          Learn how components can{' '}
          <A hook="components" to={{ pageName: 'components' }} isExternal>
            help your team today
          </A>
          .
        </span>
      </div>
    </div>
  )
}

export default ComponentsNotConfigured
