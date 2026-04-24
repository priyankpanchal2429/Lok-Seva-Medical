/**
 * DateRangePicker Component
 * Refined popover-style date range selector matching the high-fidelity reference.
 */

import { useState, useEffect, useRef } from 'react';

export default function DateRangePicker({ isOpen, onClose, onApply, initialRange }) {
  const modalRef = useRef(null);
  const [startDate, setStartDate] = useState(initialRange?.start || '24-10-2025');
  const [endDate, setEndDate] = useState(initialRange?.end || '24-04-2026');
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.addEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const presets = [
    'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last Month',
    'Last 3 Month', 'Last 6 Month', 'Last 1 Year', 'Current Month', 'Current F.Y.'
  ];

  return (
    <div style={styles.popoverOverlay}>
      <div ref={modalRef} style={styles.container}>
        {/* Popover Arrow */}
        <div style={styles.arrow}></div>

        <div style={styles.main}>
          {/* Left Sidebar Presets */}
          <div style={styles.sidebar}>
            {presets.map((preset, idx) => (
              <div key={preset} style={{
                ...styles.presetItem,
                color: idx === 0 ? '#fff' : 'var(--color-text-secondary)',
                fontWeight: idx === 0 ? 600 : 400
              }}>
                {preset}
              </div>
            ))}
          </div>

          {/* Calendars Section */}
          <div style={styles.calendarSection}>
            <div style={styles.calendarGrid}>
              {/* Oct 2025 */}
              <CalendarMock 
                month="Oct" 
                year="2025" 
                selectedDay={24} 
                rangeStart={25} 
                rangeEnd={31}
                showRangeEndFade
              />
              {/* Apr 2026 */}
              <CalendarMock 
                month="Apr" 
                year="2026" 
                selectedDay={24} 
                rangeStart={1} 
                rangeEnd={23} 
                showRangeStartFade
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.rangeDisplay}>
            {startDate} To {endDate}
          </div>
          <div style={styles.actions}>
            <button className="si-btn si-btn-secondary" onClick={onClose} style={{ borderRadius: '6px', padding: '8px 24px', fontSize: '13px', background: '#fff', color: '#000', border: 'none' }}>
              Cancel
            </button>
            <button className="si-btn si-btn-primary" onClick={() => onApply(startDate, endDate)} style={{ borderRadius: '6px', padding: '8px 24px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--color-primary)' }}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarMock({ month, year, selectedDay, rangeStart, rangeEnd }) {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const emptyCells = month === 'Oct' ? 2 : 0; // Simplified padding for Oct

  return (
    <div style={styles.calendar}>
      <div style={styles.calendarHeader}>
        <button style={styles.navBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div style={styles.headerDate}>
          <span style={styles.datePart}>{month} <span style={styles.arrowIcon}>↕</span></span>
          <span style={styles.datePart}>{year} <span style={styles.arrowIcon}>↕</span></span>
        </div>
        <button style={styles.navBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <div style={styles.dayHeaderGrid}>
        {days.map(d => <div key={d} style={styles.dayName}>{d}</div>)}
      </div>

      <div style={styles.daysGrid}>
        {/* Empty cells for start of month */}
        {Array.from({ length: emptyCells }).map((_, i) => <div key={`e-${i}`} />)}
        
        {Array.from({ length: 31 }).map((_, i) => {
          const day = i + 1;
          const isInRange = day >= rangeStart && day <= rangeEnd;
          const isSelected = day === selectedDay;
          
          return (
            <div 
              key={i} 
              style={{
                ...styles.dayCell,
                backgroundColor: isSelected ? 'var(--color-primary)' : (isInRange ? 'rgba(0, 204, 153, 0.08)' : 'transparent'),
                color: isSelected ? '#fff' : (isInRange ? 'var(--color-text)' : 'var(--color-text-secondary)'),
                borderRadius: isSelected ? '6px' : '0px',
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
    top: '110px',
    right: '24px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '8px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    width: '680px',
    overflow: 'visible',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  },
  arrow: {
    display: 'none', // Removed arrow to match screenshot better
  },
  main: {
    display: 'flex',
  },
  sidebar: {
    width: '160px',
    borderRight: '1px solid var(--color-border)',
    padding: '16px 0',
    backgroundColor: 'var(--color-surface)', // Match container
  },
  presetItem: {
    padding: '10px 24px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  calendarSection: {
    flex: 1,
    padding: '24px 32px',
    backgroundColor: 'var(--color-surface)',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  },
  calendar: {
    width: '100%',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  headerDate: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    fontWeight: 500,
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
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  dayHeaderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: '12px',
  },
  dayName: {
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 700,
    color: '#fff', // White headers as in screenshot
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    rowGap: '2px',
  },
  dayCell: {
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    cursor: 'pointer',
  },
  footer: {
    padding: '16px 32px',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface)', // Match container
  },
  rangeDisplay: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  }
};
