import { type FC, useMemo } from 'react';

import './style.css';

interface PaginationProps {
  count: number;
  page: number;
  pageSize: number;
  selector?: number[];
  maxButtons?: number;
  onChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}
export const Pagination: FC<PaginationProps> = (props) => {
  const {
    count,
    page,
    pageSize,
    selector = [50, 100, 200],
    maxButtons = 9,
    onChange,
    onPageSizeChange,
  } = props;

  const totalPage = useMemo(() => {
    return Math.ceil(count / pageSize);
  }, [count, pageSize]);

  const getPageNumbers = () => {
    const buttons = [];
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPage, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      buttons.push(i);
    }

    if (start > 2) {
      buttons.unshift('...');
      buttons.unshift(1);
    } else if (start === 2) {
      buttons.unshift(1);
    }

    if (end < totalPage - 1) {
      buttons.push('...');
      buttons.push(totalPage);
    } else if (end === totalPage - 1) {
      buttons.push(totalPage);
    }
    return buttons;
  };
  return (
    <div className="pagination-container">
      {selector.length > 0 && (
        <select
          className="pagination-selector"
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
        >
          {selector.map((size) => (
            <option key={size} value={size}>
              {size} /page
            </option>
          ))}
        </select>
      )}

      <div className="pagination-buttons">
        <button
          className="pagination-button"
          onClick={() => onChange?.(page - 1)}
          disabled={page <= 1}
          aria-label="previous page"
        >
          ‹
        </button>

        {getPageNumbers().map((num, index) =>
          num === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={num}
              className={`pagination-button ${page === num ? 'active' : ''}`}
              onClick={() => onChange?.(Number(num))}
              aria-label={`Jump to page ${num}`}
            >
              {num}
            </button>
          )
        )}

        <button
          className="pagination-button"
          onClick={() => onChange?.(page + 1)}
          disabled={page >= totalPage}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      <div className="pagination-info">
        Total Rows: {count} | {page} of {totalPage} 
      </div>
    </div>
  );
};
