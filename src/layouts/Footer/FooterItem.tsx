import PropType from 'prop-types'

import A from 'ui/A'

export interface FooterItemProps {
  text?: string
  to?: { pageName: string }
}

export function FooterItem({ text, to }: FooterItemProps) {
  return (
    <li className="flex justify-center">
      {to ? (
        <A
          to={to}
          showExternalIcon={false}
          variant="grayQuinary"
          hook={undefined}
          isExternal={false}
        >
          {text}
        </A>
      ) : (
        <span className="text-ds-gray-quinary">{text}</span>
      )}
    </li>
  )
}

FooterItem.propTypes = {
  text: PropType.string,
  to: PropType.shape({ pageName: PropType.string }),
}
