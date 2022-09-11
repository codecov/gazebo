import { useLocation } from 'react-router-dom'

import A from 'ui/A'

function FeedbackLink() {
  const { pathname } = useLocation()

  const header = pathname.includes('feedback') ? 'headerHighlight' : 'header'

  return (
    <div className="border-l py-1 pl-4">
      <A to={{ pageName: 'feedback' }} variant={header}>
        Feedback
      </A>
    </div>
  )
}

export default FeedbackLink
