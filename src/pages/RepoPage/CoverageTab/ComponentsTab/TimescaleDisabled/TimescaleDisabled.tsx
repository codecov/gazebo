import A from 'ui/A'

import componentsEmptyState from '../assets/componentsEmptystate.svg'

function TimescaleDisabled() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center gap-2 text-ds-gray-octonary">
      <div className="flex min-w-[60%] flex-col justify-center gap-2 text-center">
        <img
          alt="Components feature not configured"
          className="mx-auto mb-8"
          src={componentsEmptyState}
        />
        <span className="text-3xl">
          The Components feature is not yet enabled{' '}
        </span>
        <span className="text-base">
          Learn how you can
          <A
            hook="componentss"
            to={{ pageName: 'deployingComponentsSupport' }}
            isExternal
          >
            enable components in your infrastructure today
          </A>
          .
        </span>
      </div>
    </div>
  )
}

export default TimescaleDisabled
