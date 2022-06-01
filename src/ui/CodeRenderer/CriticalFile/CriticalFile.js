import A from 'ui/A'
import Icon from 'ui/Icon'

function CriticalFile() {
  return (
    <div className="bg-gray-100 flex items-center">
      <div className="text-warning-500">
        <Icon name="exclamation-circle" size="sm" variant="outline" />
      </div>
      <p className="pl-1">
        This is a <span className="font-semibold">critical file</span>, which
        contains lines commonly executed in production{' '}
        <A
          variant="link"
          isExternal
          href="https://docs.codecov.com/docs/runtime-insights"
        >
          <span className="font-semibold">learn more</span>
        </A>
      </p>
    </div>
  )
}

export default CriticalFile
