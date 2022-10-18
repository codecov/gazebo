import PropTypes from 'prop-types'

import MultiSelect from 'ui/NewMultiSelect'
import Spinner from 'ui/Spinner'

import CoverageSelect from './CoverageSelect'

export default function Title({ title, children }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap px-3 md:p-0">
      <span className="text-ds-gray-senary font-semibold text-base">
        {title}
      </span>
      <div className="flex flex-row items-center justify-between gap-2">
        {children}
      </div>
    </div>
  )
}

Title.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  Flags: PropTypes.func,
}

export const TitleCoverage = CoverageSelect

export const TitleFlags = ({
  flags,
  onFlagsChange,
  flagsIsLoading = false,
}) => {
  return (
    <>
      {flagsIsLoading && <Spinner />}
      <MultiSelect
        dataMarketing="fileviwer-filter-by-flags"
        ariaName="Filter by flags"
        items={flags}
        onChange={onFlagsChange}
        resourceName="Flag"
      />
    </>
  )
}

TitleFlags.propTypes = {
  flags: PropTypes.arrayOf(PropTypes.string),
  onFlagsChange: PropTypes.func.isRequired,
  flagsIsLoading: PropTypes.bool,
}
