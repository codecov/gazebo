import PropType from 'prop-types'

import Spinner from 'ui/Spinner'

const Loader = ({ isLoading }) => {
  return (
    isLoading && (
      <div className="flex flex-1 justify-center">
        <Spinner size={60} />
      </div>
    )
  )
}

Loader.propTypes = {
  isLoading: PropType.bool,
}

export default Loader
