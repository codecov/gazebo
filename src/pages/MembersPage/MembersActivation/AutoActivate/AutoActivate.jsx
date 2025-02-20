import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useAutoActivate } from 'services/account/useAutoActivate'
import Toggle from 'ui/Toggle'

function AutoActivate({ planAutoActivate }) {
  const { owner, provider } = useParams()
  const { mutate: autoActivate } = useAutoActivate({ owner, provider })

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="font-semibold">
        <Toggle
          dataMarketing="auto-activate-members"
          onClick={() => autoActivate(!planAutoActivate)}
          value={planAutoActivate}
          label="Auto-activate members"
        />
      </div>
      <p>
        Members will automatically be assigned a Codecov seat if they 1) author
        a pull request on a private repo, or 2) log in to a private repo and if
        there are seats available in the subscription.
      </p>
    </div>
  )
}

AutoActivate.propTypes = {
  planAutoActivate: PropTypes.bool.isRequired,
}

export default AutoActivate
