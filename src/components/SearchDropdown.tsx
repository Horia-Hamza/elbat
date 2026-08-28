import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { productsApi } from '../api/products';

interface SearchDropdownProps {
  /** Value kept in sync with App-level searchQuery (for text filter fallback) */
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

interface LookupItem {
  id: number;
  name: string;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState(searchQuery);
  const [results, setResults] = useState<LookupItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  // Keep local input in sync when parent clears the query
  useEffect(() => {
    if (!searchQuery) setInputValue('');
  }, [searchQuery]);

  // ── Debounced fetch ────────────────────────────────────────────
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLookup = useCallback((value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await productsApi.getProductLookup(value.trim());
        const items: LookupItem[] = Array.isArray(data)
          ? data
          : (data as any)?.data || [];
        setResults(items);
        setOpen(items.length > 0);
        setActiveIdx(-1);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onSearchChange(val);       // keep text filter working
    fetchLookup(val);
  };

  const handleSelect = (item: LookupItem) => {
    setInputValue('');
    onSearchChange('');
    setOpen(false);
    setResults([]);
    navigate(`/product/${item.id}`);
  };

  const handleClear = () => {
    setInputValue('');
    onSearchChange('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="search-dropdown-wrapper" style={{ position: 'relative', flex: 1 }}>
      {/* ── Input ── */}
      <div className="search-bar" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="ابحثي عن منتج..."
          className="search-input"
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
          dir="rtl"
        />
        {/* spinner / clear / search icon */}
        {loading ? (
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16,
              border: '2px solid #e2e8f0',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}
          />
        ) : inputValue ? (
          <X
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
            onClick={handleClear}
          />
        ) : (
          <Search className="search-icon" size={18} />
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && results.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            left: 0,
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(35,107,147,0.15), 0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid rgba(35,107,147,0.12)',
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
            zIndex: 9999,
            maxHeight: '320px',
            overflowY: 'auto',
          }}
        >
          {results.map((item, idx) => (
            <li
              key={item.id}
              role="option"
              aria-selected={idx === activeIdx}
              onMouseDown={() => handleSelect(item)}
              onMouseEnter={() => setActiveIdx(idx)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                direction: 'rtl',
                fontWeight: idx === activeIdx ? 600 : 400,
                background: idx === activeIdx
                  ? 'linear-gradient(90deg, rgba(35,107,147,0.08), rgba(35,107,147,0.04))'
                  : 'transparent',
                color: idx === activeIdx ? 'var(--primary-dark)' : 'var(--text-main)',
                fontSize: '0.92rem',
                transition: 'background 0.15s',
                borderBottom: idx < results.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
              }}
            >
              <Search size={13} style={{ opacity: 0.4, flexShrink: 0 }} />
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
