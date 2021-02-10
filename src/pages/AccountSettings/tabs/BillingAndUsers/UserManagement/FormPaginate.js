import PropTypes from 'prop-types'

import Pagination from 'ui/Pagination'

const FormPaginateClasses = {
  container: 'flex justify-between pt-6 pb-2',
  flex1: 'flex-1',
  right: 'flex-1 max-w-max flex items-center',
  label: 'flex-initial mr-2',
}

export function FormPaginate({
  totalPages,
  page = 1,
  next,
  previous,
  onChange,
}) {
  return (
    <div className={FormPaginateClasses.container}>
      {totalPages > 1 && (
        <Pagination
          className={FormPaginateClasses.flex1}
          onPageChange={(page) => onChange({ page })}
          pointer={parseInt(page, 10)}
          totalPages={totalPages}
          next={next}
          previous={previous}
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
  onChange: PropTypes.func.isRequired,
}
