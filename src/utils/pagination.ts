/**
 * Calculate pagination metadata
 */
export interface PaginationResult {
  page: number
  limit: number
  skip: number
  totalPages: number
  totalItems: number
}

export const calculatePagination = (page = 1, limit = 10, totalItems: number): PaginationResult => {
  const currentPage = Math.max(1, page)
  const itemsPerPage = Math.max(1, Math.min(100, limit)) // Max 100 items per page
  const skip = (currentPage - 1) * itemsPerPage
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    page: currentPage,
    limit: itemsPerPage,
    skip,
    totalPages,
    totalItems,
  }
}
