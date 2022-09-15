import A from 'ui/A'

function ActivationLimit() {
  return (
    <p>
      Your org has reached the available seats. Any additional members will not
      have access to the app and pull request data. Please reach out to{' '}
      <A href="mailto:success@codecov.io" hook="support email">
        success@codecov.io
      </A>{' '}
      to update your account.
    </p>
  )
}

export default ActivationLimit
