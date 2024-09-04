import { ComparisonReturnType } from 'shared/utils/comparison'
import { formatTimeToNow } from 'shared/utils/dates'
import A from 'ui/A'
import Avatar, { DefaultAuthor } from 'ui/Avatar'

interface TitleProps {
  author: {
    username?: string | null
    avatarUrl?: string | null
  }
  pullId: number
  title: string
  updatestamp?: string
  compareWithBaseType?: string
}

const Title: React.FC<TitleProps> = ({
  author,
  pullId,
  title,
  updatestamp,
  compareWithBaseType,
}) => {
  const user = {
    avatarUrl: author?.avatarUrl ?? DefaultAuthor.AVATAR_URL,
    username: author?.username ?? DefaultAuthor.USERNAME,
  }

  let pageName = 'pullDetail'
  if (compareWithBaseType === ComparisonReturnType.FIRST_PULL_REQUEST) {
    pageName = 'pullTreeView'
  }

  return (
    <div className="flex w-96 flex-row lg:w-auto">
      <span className="mr-5 flex items-center">
        <Avatar user={user} border="light" />
      </span>
      <div className="flex w-5/6 flex-col lg:w-auto">
        {/* @ts-expect-error - disable because of non-ts component and type mismatch */}
        <A
          to={{
            pageName,
            options: { pullId },
          }}
        >
          <h2 className="text-sm font-semibold text-ds-secondary-text">
            {title}
          </h2>
        </A>
        <p className="text-xs">
          <span className="text-ds-secondary-text">{author?.username}</span>
          {updatestamp && (
            <span className="text-ds-gray-quinary">
              {' '}
              last updated {formatTimeToNow(updatestamp)}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

export default Title
