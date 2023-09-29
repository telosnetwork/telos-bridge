import {useEffect, useRef, useState} from 'react';

export function usePagination<T>(items: T[], perPage = 8, resetPageOnChange = false) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPagesCount = Math.ceil(items.length / perPage);
  const currentPageItems = items.slice((currentPage - 1) * perPage, currentPage * perPage);
  // reset to 1st page on change
  const lengthRef = useRef(items.length);
  useEffect(() => {
    if (lengthRef.current === items.length) return;
    if (resetPageOnChange) {
      setCurrentPage(1);
    } else if (currentPage > totalPagesCount) {
      setCurrentPage(totalPagesCount);
    }
    lengthRef.current = items.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, perPage, resetPageOnChange]);

  return {
    onNextPage: () => setCurrentPage(Math.min(currentPage + 1, totalPagesCount)),
    onPrevPage: () => setCurrentPage(Math.max(currentPage - 1, 1)),
    currentPage,
    currentPageItems,
    totalPagesCount,
  };
}
