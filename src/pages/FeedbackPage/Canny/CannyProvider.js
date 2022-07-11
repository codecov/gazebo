import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Canny, CannyLoader } from './cannyUtils'

const CannyContext = createContext({})

export const useCannyContext = () => {
  return useContext(CannyContext)
}

function CannyProvider({ children }) {
  const [isLoaded, setLoaded] = useState(false)
  const refCanny = useRef(null)

  // TODO: the package I was following had isLoaded as a dep
  const canny = useMemo(() => new Canny(refCanny.current), [])

  useEffect(() => {
    const loader = new CannyLoader()

    loader
      .load()
      .then((canny) => {
        refCanny.current = canny
        setLoaded(true)
      })
      .catch((err) => {
        console.debug(err)
      })
  }, [])

  return (
    <CannyContext.Provider value={{ isLoaded, canny }}>
      {children}
    </CannyContext.Provider>
  )
}

export default CannyProvider
