interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 pt-6">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-zinc-400">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
