import PropTypes from 'prop-types'

import Pagination from 'ui/Pagination'
import Select from 'ui/Select'

const FormPaginateClasses = {
  container: 'flex justify-between pt-6 pb-2',
  flex1: 'flex-1',
  right: 'flex-1 max-w-max flex items-center',
  label: 'flex-initial mr-2',
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
        className={FormPaginateClasses.flex1}
        onPageChange={(page) => onChange({ page })}
        pointer={parseInt(page, 10)}
        totalPages={totalPages}
        next={next}
        previous={previous}
      />
      {_createPageSizes().length > 1 && (
        <div className={FormPaginateClasses.right}>
          <span className={FormPaginateClasses.label}>Users per:</span>
          <Select
            ariaName="select page size"
            className={FormPaginateClasses.flex1}
            onChange={(data) => onChange({ page: 1, pageSize: data })}
            items={_createPageSizes()}
            value={parseInt(pageSize, 10)}
          />
        </div>
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
