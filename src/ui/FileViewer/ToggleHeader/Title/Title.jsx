import cs from 'classnames'
import PropTypes from 'prop-types'

import MultiSelect from 'ui/MultiSelect'
import Spinner from 'ui/Spinner'

import CoverageSelect from './CoverageSelect'

export default function Title({ title, children, sticky = false }) {
  return (
    <div
      className={cs(
        { 'z-10 sticky top-[4.5rem]': sticky },
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap bg-white px-3 sm:px-0 py-3'
      )}
    >
      {title && (
        <span className="text-ds-gray-senary font-semibold text-base">
          {title}
        </span>
      )}
      <div className="flex flex-row items-center justify-between gap-2">
        {children}
      </div>
    </div>
  )
}

Title.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  Flags: PropTypes.func,
  sticky: PropTypes.bool,
}

export const TitleCoverage = CoverageSelect

export const TitleFlags = ({
  flags,
  onFlagsChange,
  flagsIsLoading = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      {flagsIsLoading && <Spinner />}
      <MultiSelect
        dataMarketing="fileviwer-filter-by-flags"
        ariaName="Filter by flags"
        items={flags}
        onChange={onFlagsChange}
        resourceName="Flag"
      />
    </div>
  )
}

TitleFlags.propTypes = {
  flags: PropTypes.arrayOf(PropTypes.string),
  onFlagsChange: PropTypes.func.isRequired,
  flagsIsLoading: PropTypes.bool,
}
