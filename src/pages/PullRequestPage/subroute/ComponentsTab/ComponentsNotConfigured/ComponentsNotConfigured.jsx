import frontendAndBackend from 'assets/frontendAndBackend.jpg'
import A from 'ui/A'

function ComponentsNotConfigured() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-1 text-center text-base text-ds-gray-octonary">
      <img
        alt="Components feature not configured"
        className="h-96 w-screen object-cover"
        src={frontendAndBackend}
      />
      <span className="mt-4 font-semibold">
        See how components can help you today!
      </span>
      <span className="w-1/2">
        Components allow you to isolate and categorize coverage data from your
        project with virtual filters. Learn how components can{' '}
        <A hook="components" to={{ pageName: 'components' }}>
          help your team today
        </A>
        .
      </span>
    </div>
  )
}

export default ComponentsNotConfigured
