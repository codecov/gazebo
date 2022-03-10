import cs from 'classnames'

import img404 from './assets/error-404.svg'
import styles from './NotFound.module.css'

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
      <p className="my-4 px-3 sm:px-0">
        Check on{' '}
        <a
          rel="noreferrer"
          className="text-blue-400"
          href="https://status.codecov.io/"
          target="_blank"
        >
          Codecov’s status
        </a>{' '}
        or see{' '}
        <a
          rel="noreferrer"
          className="text-blue-400"
          href="https://docs.codecov.io/"
          target="_blank"
        >
          our docs
        </a>{' '}
        for common support.
      </p>
      <p>
        <strong>Error 404</strong>
      </p>
    </article>
  )
}

export default NotFound
