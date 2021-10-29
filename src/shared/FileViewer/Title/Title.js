import PropTypes from 'prop-types'

import MultiSelect from 'ui/MultiSelect'
import Spinner from 'ui/Spinner'

import CoverageSelect from '../CoverageSelect'

export default function Title({ title, Flags, children }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap px-3 md:p-0">
      <span className="text-ds-gray-senary font-semibold text-base">
        {title}
      </span>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-7">
        <span className="mb-2 sm:mb-0 text-xs font-semibold">
          View coverage by:
        </span>
        {children}
        {Flags()}
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
  list,
  current,
  onChange,
  flagsIsLoading = false,
}) => {
  return (
    list.length > 1 && (
      <>
        {flagsIsLoading && <Spinner />}
        <MultiSelect
          ariaName="Filter by flags"
          selectedItems={current}
          items={list}
          onChange={onChange}
          resourceName="flag"
        />
      </>
    )
  )
}

TitleFlags.propTypes = {
  list: PropTypes.arrayOf(PropTypes.string).isRequired,
  current: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  flagsIsLoading: PropTypes.bool,
}
