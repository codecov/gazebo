import A from 'ui/A'

import flagsEmptyState from '../assets/flagsEmptystate.svg'

function FlagsNotConfigured() {
  return (
    <div className="flex items-center justify-center flex-col text-ds-gray-octonary gap-2 mt-20">
      <div className="flex flex-col text-center justify-center gap-2 min-w-[60%]">
        <img
          alt="Flags feature not configured"
          className="mx-auto mb-8"
          src={flagsEmptyState}
        />
        <span className="text-3xl">
          The Flags feature is not yet configured{' '}
        </span>
        <span className="text-base">
          Learn how flags can{' '}
          <A hook="flags" to={{ pageName: 'flags' }}>
            help your team today
          </A>
          .
        </span>
      </div>
    </div>
  )
}

export default FlagsNotConfigured
