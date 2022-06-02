import A from 'ui/A'
import Icon from 'ui/Icon'

function CriticalFileLabel() {
  return (
    <div className="pointer-events-autoflex gap-1 bg-ds-gray-primary px-4 py-1 items-center border-r border-l border-b border-solid border-ds-gray-tertiary">
      <div className="text-warning-500">
        <Icon name="exclamation-circle" size="sm" variant="outline" />
      </div>
      <p>
        This is a <span className="font-semibold">critical file</span>, which
        contains lines commonly executed in production{' '}
        <A
          variant="link"
          isExternal
          href="https://docs.codecov.com/docs/runtime-insights"
          hook="codecov-docs"
        >
          <span className="font-semibold">learn more</span>
        </A>
      </p>
    </div>
  )
}

export default CriticalFileLabel
