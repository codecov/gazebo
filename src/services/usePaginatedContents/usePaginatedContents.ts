import { useState } from 'react'

import { ITEMS_PER_PAGE } from './constants'

interface PaginatedContents<T> {
  paginatedData: T[]
  hasNextPage: boolean
  handlePaginationClick: () => void
}

// Frontend Pagination
export function usePaginatedContents<T>({
  data,
}: {
  data: T[]
}): PaginatedContents<T> {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)
  const paginatedData = data?.slice(0, itemsPerPage)
  const hasNextPage = currentPage * ITEMS_PER_PAGE < data?.length
  function handlePaginationClick() {
    setItemsPerPage((prevItems) => prevItems + ITEMS_PER_PAGE)
    setCurrentPage((prevPage) => prevPage + 1)
  }
  return { paginatedData, hasNextPage, handlePaginationClick }
}
