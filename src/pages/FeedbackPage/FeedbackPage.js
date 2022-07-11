import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import A from 'ui/A'
import Icon from 'ui/Icon'

import CannyProvider from './Canny/CannyProvider'
import CannyWidget from './Canny/CannyWidget'

const BOARD_TOKEN = ''
const SSO_TOKEN = ''

function FeedbackPage() {
  const { provider } = useParams()
  const { search } = useLocation()
  const query = useMemo(() => new URLSearchParams(search), [search])

  return (
    <>
      <div className="flex pt-2 pb-4 mb-8 border-b">
        <A to={{ pageName: 'prevLink', options: { ref: query.get('ref') } }}>
          <Icon size="md" name="chevron-left" />
          Back
        </A>
      </div>
      <div>
        <CannyProvider>
          <CannyWidget
            basePath={`/${provider}/feedback`}
            boardToken={BOARD_TOKEN}
            ssoToken={SSO_TOKEN}
          />
        </CannyProvider>
      </div>
    </>
  )
}

export default FeedbackPage
