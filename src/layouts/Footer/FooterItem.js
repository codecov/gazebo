import PropType from 'prop-types'

export function FooterItem({ text, path }) {
  return (
    <li className="flex justify-center">
      {path ? (
        <a
          className="p-4 no-underline hover:underline hover:text-blue-400"
          href={path()}
        >
          {text}
        </a>
      ) : (
        text
      )}
    </li>
  )
}

FooterItem.propTypes = {
  text: PropType.string.isRequired,
  path: PropType.func,
}
