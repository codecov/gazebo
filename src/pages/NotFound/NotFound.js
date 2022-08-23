import cs from 'classnames'

import config from 'config'

import img404 from './assets/error-404.svg'
import styles from './NotFound.module.css'

const NotFoundErrorMessage = () => {
  const { origin } = window.location

  const href = config.IS_ENTERPRISE ? origin : 'https://app.codecov.io/'

  if (config.IS_ENTERPRISE) {
    return (
      <p className="my-4 px-3 sm:px-0">
        You may be able to locate this content by browsing for it from{' '}
        <a
          rel="noreferrer"
          className="text-blue-400"
          href={href}
          target="_blank"
        >
          the home page
        </a>
      </p>
    )
  }

  return (
    <p className="my-4 px-3 sm:px-0">
      You may be able to locate the content by visiting{' '}
      <a rel="noreferrer" className="text-blue-400" href={href} target="_blank">
        Codecov’s home page
      </a>{' '}
      and browsing to it.
    </p>
  )
}

const NotFound = () => {
  const { illustration, title } = {
    illustration: img404,
    title: 'Not found',
  }

  return (
    <article className="mx-auto h-full flex items-center justify-center flex-col">
      <img
        alt="illustration error"
        className={cs(styles.illustrationError, 'mx-auto')}
        src={illustration}
      />
      <h1 className="text-2xl mt-6">{title}</h1>
      <NotFoundErrorMessage />
      <p>
        <strong>Error 404</strong>
      </p>
    </article>
  )
}

export default NotFound
