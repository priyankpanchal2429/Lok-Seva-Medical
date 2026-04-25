/**
 * DatePicker Component
 * Custom calendar date picker with two modes:
 *   - "date"  → Full day calendar (for invoice dates)
 *   - "month" → Month/Year grid (for expiry dates)
 * Renders dropdown via portal to avoid overflow clipping in tables.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

// ============================================================
// Constants
// ============================================================

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ============================================================
// SVG Icons
// ============================================================

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// ============================================================
// Component
// ============================================================

/**
 * @param {string}   value            - "YYYY-MM-DD" (date) or "YYYY-MM" (month)
 * @param {function} onChange          - Callback returning formatted string
 * @param {string}   placeholder      - Placeholder text
 * @param {'date'|'month'} mode       - Picker mode
 * @param {string}   className        - CSS class for the trigger input
 * @param {string}   wrapperClassName - CSS class for the outer wrapper
 */
export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  mode = 'date',
  className = '',
  wrapperClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const today = new Date();

  // ---- Parse value into { year, month, day } ----
  const parsedValue = useMemo(() => {
    if (!value) return null;
    if (mode === 'month') {
      const [y, m] = value.split('-').map(Number);
      if (!y || !m) return null;
      return { year: y, month: m - 1 };
    }
    const d = new Date(value + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }, [value, mode]);

  // ---- View state (currently displayed month/year) ----
  const [viewYear, setViewYear] = useState(parsedValue?.year || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedValue?.month ?? today.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    if (parsedValue) {
      const timer = setTimeout(() => {
        setViewYear(parsedValue.year);
        setViewMonth(parsedValue.month);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [parsedValue]);

  // ---- Close on outside click (handles portal dropdown) ----
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      const clickedInput = inputRef.current?.contains(e.target);
      const clickedDropdown = dropdownRef.current?.contains(e.target);
      if (!clickedInput && !clickedDropdown) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ---- Close on scroll/resize to prevent stale position ----
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  // ---- Navigation handlers ----
  const goToPrevMonth = useCallback(() => {
    setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });
  }, []);

  const goToPrevYear = useCallback(() => setViewYear(y => y - 1), []);
  const goToNextYear = useCallback(() => setViewYear(y => y + 1), []);

  // ---- Selection handlers ----
  const handleSelectDay = useCallback((day) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  }, [viewYear, viewMonth, onChange]);

  const handleSelectMonth = useCallback((monthIndex) => {
    const formatted = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  }, [viewYear, onChange]);

  // ---- Display string for input ----
  const displayValue = useMemo(() => {
    if (!parsedValue) return '';
    if (mode === 'month') return `${MONTH_NAMES[parsedValue.month]} ${parsedValue.year}`;
    return `${String(parsedValue.day).padStart(2, '0')} ${MONTH_NAMES[parsedValue.month]} ${parsedValue.year}`;
  }, [parsedValue, mode]);

  // ---- Build calendar day grid ----
  const calendarDays = useMemo(() => {
    if (mode !== 'date') return [];
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();
    const days = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrev - i, current: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, current: true });
    }
    // Next month fill (complete last row)
    const fill = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= fill; i++) {
      days.push({ day: i, current: false });
    }
    return days;
  }, [viewYear, viewMonth, mode]);

  // ---- Day state checks ----
  const isToday = (day) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (day) =>
    parsedValue && mode === 'date' && day === parsedValue.day &&
    viewMonth === parsedValue.month && viewYear === parsedValue.year;

  const isMonthSelected = (mi) =>
    parsedValue && mode === 'month' && mi === parsedValue.month && viewYear === parsedValue.year;

  // ---- Year options for <select> ----
  const currentYear = today.getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 10; y <= currentYear + 10; y++) yearOptions.push(y);

  // ---- Dropdown position (fixed, relative to viewport) ----
  const getPosition = useCallback(() => {
    if (!inputRef.current) return { top: 0, left: 0 };
    const rect = inputRef.current.getBoundingClientRect();
    
    let left = rect.left;
    const dropdownWidth = 320; // Estimated width of the calendar
    
    // Prevent clipping on the right edge of the screen
    if (left + dropdownWidth > window.innerWidth - 20) {
      left = Math.max(20, window.innerWidth - dropdownWidth - 20);
    }
    
    return { top: rect.bottom + 4, left };
  }, []);

  const [pos, setPos] = useState({ top: 0, left: 0 });
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setPos(getPosition()), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, getPosition]);

  return (
    <div className={`dp-wrapper ${wrapperClassName}`}>
      {/* Trigger Input — styled same as si-input fields */}
      <input
        ref={inputRef}
        type="text"
        className={className}
        value={displayValue}
        placeholder={placeholder}
        readOnly
        onClick={() => setIsOpen(prev => !prev)}
        style={{ cursor: 'pointer' }}
      />

      {/* Dropdown via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="dp-dropdown"
          style={{ position: 'fixed', top: `${pos.top}px`, left: `${pos.left}px`, zIndex: 9999 }}
        >
          {/* Header: nav + selectors */}
          <div className="dp-header">
            <button className="dp-nav-btn" type="button" onClick={mode === 'month' ? goToPrevYear : goToPrevMonth}>
              <ChevronLeft />
            </button>
            <div className="dp-selectors">
              {mode === 'date' ? (
                <>
                  <select className="dp-select" value={viewMonth} onChange={(e) => setViewMonth(Number(e.target.value))}>
                    {MONTH_NAMES.map((n, i) => <option key={i} value={i}>{n}</option>)}
                  </select>
                  <select className="dp-select" value={viewYear} onChange={(e) => setViewYear(Number(e.target.value))}>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </>
              ) : (
                <select className="dp-select" value={viewYear} onChange={(e) => setViewYear(Number(e.target.value))}>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              )}
            </div>
            <button className="dp-nav-btn" type="button" onClick={mode === 'month' ? goToNextYear : goToNextMonth}>
              <ChevronRight />
            </button>
          </div>

          {/* Body */}
          {mode === 'date' ? (
            <div className="dp-calendar">
              <div className="dp-day-headers">
                {DAY_NAMES.map(d => <div key={d} className="dp-day-header">{d}</div>)}
              </div>
              <div className="dp-day-grid">
                {calendarDays.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`dp-day${!d.current ? ' dp-day-outside' : ''}${d.current && isToday(d.day) ? ' dp-day-today' : ''}${d.current && isSelected(d.day) ? ' dp-day-selected' : ''}`}
                    onClick={() => d.current && handleSelectDay(d.day)}
                    disabled={!d.current}
                  >
                    {d.day}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="dp-month-grid">
              {MONTH_NAMES.map((name, i) => (
                <button
                  key={i}
                  type="button"
                  className={`dp-month-cell${isMonthSelected(i) ? ' dp-month-selected' : ''}`}
                  onClick={() => handleSelectMonth(i)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
