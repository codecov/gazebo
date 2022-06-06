import PropType from 'prop-types'

import A from 'ui/A'

export function FooterItem({ text, to }) {
  return (
    <li className="flex justify-center text-ds-gray-quinary">
      {to ? (
        <A to={to} showExternalIcon={false}>
          {text}
        </A>
      ) : (
        text
      )}
    </li>
  )
}

FooterItem.propTypes = {
  text: PropType.string.isRequired,
  to: PropType.shape({ pageName: PropType.string }),
}
