export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMetadata;
}

export function getPaginationParams(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageParam = parseInt(searchParams.get("page") || "1");
  const limitParam = parseInt(searchParams.get("limit") || "10");

  const page = isNaN(pageParam) ? 1 : Math.max(1, pageParam);
  const limit = isNaN(limitParam) ? 10 : Math.max(1, Math.min(100, limitParam));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
