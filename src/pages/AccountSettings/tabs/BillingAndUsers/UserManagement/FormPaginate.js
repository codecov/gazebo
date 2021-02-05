import PropTypes from 'prop-types'

import Pagination from 'ui/Pagination'
import Select from 'ui/Select'

const FormPaginateClasses = {
  container: 'flex justify-between',
  left: 'flex-inital',
  right: 'flex-inital',
}

export function FormPaginate({
  totalPages = 10,
  page,
  next,
  previous,
  pageSize,
  onChange,
}) {
  // Filter out page sizes which are larger then the total number of pages
  function _createPageSizes() {
    const max = totalPages
    const defaultPages = [10, 20, 50, 100]
    return defaultPages.filter((num) => num <= max)
  }

  return (
    <div className={FormPaginateClasses.container}>
      <Pagination
        className={FormPaginateClasses.left}
        onPageChange={(page) => onChange({ page })}
        pointer={parseInt(page, 10)}
        totalPages={totalPages}
        next={next}
        previous={previous}
      />
      {_createPageSizes().length > 1 && (
        <Select
          ariaName="select page size"
          className={FormPaginateClasses.right}
          onChange={(data) => onChange({ page: 1, pageSize: data })}
          items={_createPageSizes()}
          value={parseInt(pageSize, 10)}
        />
      )}
    </div>
  )
}

FormPaginate.propTypes = {
  totalPages: PropTypes.number.isRequired,
  page: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  next: PropTypes.string,
  previous: PropTypes.string,
  pageSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  onChange: PropTypes.func.isRequired,
}
