/**
 * DateRangePicker Component
 * Fully functional, compact popover-style date range selector matching the high-fidelity reference.
 */

import { useState, useEffect, useRef } from 'react';

// --- Utility Functions ---

const parseDateString = (str) => {
  if (!str) return null;
  const [day, month, year] = str.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

const formatDateString = (date) => {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const isSameDay = (d1, d2) => {
  return d1 && d2 && d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};

const isBeforeDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const d1Copy = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const d2Copy = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return d1Copy < d2Copy;
};

const isAfterDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const d1Copy = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const d2Copy = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return d1Copy > d2Copy;
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Map Sunday (0) to 6, Monday (1) to 0, etc.
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// --- Component ---

export default function DateRangePicker({ isOpen, onClose, onApply, initialRange }) {
  const modalRef = useRef(null);
  
  // Real Date objects
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  
  // Active preset
  const [activePreset, setActivePreset] = useState('');

  // Calendar View State (left calendar month/year)
  const [viewDate, setViewDate] = useState(new Date());

  // Initialize from props
  useEffect(() => {
    if (isOpen) {
      if (initialRange?.start && initialRange?.end) {
        const start = parseDateString(initialRange.start);
        const end = parseDateString(initialRange.end);
        setStartDate(start);
        setEndDate(end);
        // Show the month of the start date
        setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
      } else {
        const today = new Date();
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
      }
    }
  }, [isOpen, initialRange]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleDayClick = (date) => {
    setActivePreset('');
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBeforeDay(date, startDate)) {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleDayMouseEnter = (date) => {
    if (startDate && !endDate) {
      setHoverDate(date);
    }
  };

  const handleMouseLeaveGrid = () => {
    setHoverDate(null);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const applyPreset = (presetName) => {
    const today = new Date();
    let start = null;
    let end = null;
    
    switch (presetName) {
      case 'Today':
        start = new Date();
        end = new Date();
        break;
      case 'Yesterday':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        break;
      case 'Last 7 Days':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        end = new Date();
        break;
      case 'Last 30 Days':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
        end = new Date();
        break;
      case 'Last Month':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'Last 3 Month':
        start = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        end = new Date();
        break;
      case 'Last 6 Month':
        start = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        end = new Date();
        break;
      case 'Last 1 Year':
        start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        end = new Date();
        break;
      case 'Current Month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'Current F.Y.':
        const currentMonth = today.getMonth();
        const startYear = currentMonth >= 3 ? today.getFullYear() : today.getFullYear() - 1;
        start = new Date(startYear, 3, 1); // April 1st
        end = new Date(startYear + 1, 2, 31); // March 31st
        break;
      default:
        break;
    }

    if (start && end) {
      setStartDate(start);
      setEndDate(end);
      setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
      setActivePreset(presetName);
    }
  };

  const handleApply = () => {
    if (startDate) {
      // If no end date selected, treat it as a single day range
      const endToApply = endDate || startDate;
      onApply(formatDateString(startDate), formatDateString(endToApply));
    }
  };

  // --- Render Helpers ---
  const leftMonth = viewDate.getMonth();
  const leftYear = viewDate.getFullYear();
  const rightDate = new Date(leftYear, leftMonth + 1, 1);
  const rightMonth = rightDate.getMonth();
  const rightYear = rightDate.getFullYear();

  const presets = [
    'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last Month',
    'Last 3 Month', 'Last 6 Month', 'Last 1 Year', 'Current Month', 'Current F.Y.'
  ];

  return (
    <div style={styles.popoverOverlay}>
      <div ref={modalRef} style={styles.container}>
        <div style={styles.main}>
          {/* Left Sidebar Presets */}
          <div style={styles.sidebar}>
            {presets.map(preset => {
              const isActive = preset === activePreset;
              return (
                <div 
                  key={preset} 
                  onClick={() => applyPreset(preset)}
                  style={{
                    ...styles.presetItem,
                    color: isActive ? '#fff' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? 600 : 400
                  }}
                >
                  {preset}
                </div>
              );
            })}
          </div>

          {/* Calendars Section */}
          <div style={styles.calendarSection} onMouseLeave={handleMouseLeaveGrid}>
            <div style={styles.calendarGrid}>
              
              {/* Left Calendar */}
              <Calendar 
                monthIdx={leftMonth} 
                year={leftYear} 
                startDate={startDate}
                endDate={endDate}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayMouseEnter={handleDayMouseEnter}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                showPrev={true}
                showNext={true}
              />

              {/* Right Calendar */}
              <Calendar 
                monthIdx={rightMonth} 
                year={rightYear} 
                startDate={startDate}
                endDate={endDate}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayMouseEnter={handleDayMouseEnter}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                showPrev={true}
                showNext={true}
              />

            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.rangeDisplay}>
            {startDate ? formatDateString(startDate) : 'Select Start'} 
            {' To '} 
            {endDate ? formatDateString(endDate) : (startDate ? formatDateString(startDate) : 'Select End')}
          </div>
          <div style={styles.actions}>
            <button className="si-btn si-btn-secondary" onClick={onClose} style={{ borderRadius: '6px', padding: '8px 24px', fontSize: '13px', background: '#fff', color: '#000', border: 'none' }}>
              Cancel
            </button>
            <button 
              className="si-btn si-btn-primary" 
              onClick={handleApply} 
              disabled={!startDate}
              style={{ 
                borderRadius: '6px', 
                padding: '8px 24px', 
                fontSize: '13px', 
                fontWeight: 600, 
                backgroundColor: startDate ? 'var(--color-primary)' : 'var(--color-border)',
                opacity: startDate ? 1 : 0.5
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar({ monthIdx, year, startDate, endDate, hoverDate, onDayClick, onDayMouseEnter, onPrevMonth, onNextMonth, showPrev, showNext }) {
  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const monthName = MONTH_NAMES[monthIdx];
  const numDays = getDaysInMonth(year, monthIdx);
  const firstDay = getFirstDayOfMonth(year, monthIdx);

  return (
    <div style={styles.calendar}>
      <div style={styles.calendarHeader}>
        <button style={{...styles.navBtn, visibility: showPrev ? 'visible' : 'hidden'}} onClick={onPrevMonth}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div style={styles.headerDate}>
          <span style={styles.datePart}>{monthName} <span style={styles.arrowIcon}>↕</span></span>
          <span style={styles.datePart}>{year} <span style={styles.arrowIcon}>↕</span></span>
        </div>
        <button style={{...styles.navBtn, visibility: showNext ? 'visible' : 'hidden'}} onClick={onNextMonth}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <div style={styles.dayHeaderGrid}>
        {daysOfWeek.map(d => <div key={d} style={styles.dayName}>{d}</div>)}
      </div>

      <div style={styles.daysGrid}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {Array.from({ length: numDays }).map((_, i) => {
          const day = i + 1;
          const currentDate = new Date(year, monthIdx, day);
          
          const isSelectedStart = isSameDay(currentDate, startDate);
          const isSelectedEnd = isSameDay(currentDate, endDate);
          const isSelected = isSelectedStart || isSelectedEnd;

          // Determine if day is in range
          let isInRange = false;
          if (startDate && endDate) {
            isInRange = (isAfterDay(currentDate, startDate) || isSameDay(currentDate, startDate)) && 
                        (isBeforeDay(currentDate, endDate) || isSameDay(currentDate, endDate));
          } else if (startDate && hoverDate) {
            const rangeStart = isBeforeDay(startDate, hoverDate) ? startDate : hoverDate;
            const rangeEnd = isBeforeDay(startDate, hoverDate) ? hoverDate : startDate;
            isInRange = (isAfterDay(currentDate, rangeStart) || isSameDay(currentDate, rangeStart)) && 
                        (isBeforeDay(currentDate, rangeEnd) || isSameDay(currentDate, rangeEnd));
          }
          
          const isEdge = isSelectedStart || isSelectedEnd || (startDate && isSameDay(currentDate, hoverDate));
          const shouldHighlight = isInRange && !isEdge;

          return (
            <div 
              key={day} 
              onClick={() => onDayClick(currentDate)}
              onMouseEnter={() => onDayMouseEnter(currentDate)}
              style={{
                ...styles.dayCell,
                backgroundColor: isSelected ? 'var(--color-primary)' : (shouldHighlight ? 'rgba(0, 204, 153, 0.08)' : 'transparent'),
                color: isSelected ? '#fff' : (shouldHighlight ? 'var(--color-text)' : 'var(--color-text-secondary)'),
                borderRadius: isSelected ? '4px' : '0px',
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  popoverOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    top: '150px',
    right: '80px', // Moved a bit to the left
    backgroundColor: 'var(--color-surface)',
    borderRadius: '6px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    width: '560px', // Compact width
    overflow: 'visible',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  },
  main: {
    display: 'flex',
  },
  sidebar: {
    width: '130px', 
    borderRight: '1px solid var(--color-border)',
    padding: '12px 0',
    backgroundColor: 'var(--color-surface)',
  },
  presetItem: {
    padding: '8px 16px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  calendarSection: {
    flex: 1,
    padding: '16px 20px',
    backgroundColor: 'var(--color-surface)',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px', 
  },
  calendar: {
    width: '100%',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  headerDate: {
    display: 'flex',
    gap: '12px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  datePart: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  arrowIcon: {
    fontSize: '10px',
    color: 'var(--color-text-muted)',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  dayHeaderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: '8px',
  },
  dayName: {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 600,
    color: '#fff',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    rowGap: '2px',
  },
  dayCell: {
    height: '28px', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    cursor: 'pointer',
  },
  footer: {
    padding: '12px 20px',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface)',
  },
  rangeDisplay: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  }
};
