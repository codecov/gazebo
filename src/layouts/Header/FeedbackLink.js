import { useLocation } from 'react-router-dom'

import A from 'ui/A'

function FeedbackLink() {
  const { pathname } = useLocation()

  let ref = ''
  let header = 'header'
  if (pathname.includes('feedback')) {
    header = 'headerHighlight'
  } else {
    ref = pathname
  }

  return (
    <div className="border-l py-1 pl-4">
      <A to={{ pageName: 'feedback', options: { ref } }} variant={header}>
        Feedback
      </A>
    </div>
  )
}

export default FeedbackLink
