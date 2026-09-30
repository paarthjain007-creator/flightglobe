import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export default function DatePicker({ date, setDate, minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative w-full' ref={containerRef}>
      <div 
        className='w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 focus-within:border-blue-400 text-white text-sm flex items-center justify-between cursor-pointer'
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{date ? format(new Date(date + 'T12:00:00Z'), 'MMM dd, yyyy') : 'Select Date'}</span>
        <CalendarIcon size={16} className='text-blue-400' />
      </div>

      {isOpen && (
        <div className='absolute top-[calc(100%+8px)] left-0 z-50 p-3 bg-[#111216]/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl'>
          <DayPicker
            mode='single'
            selected={date ? new Date(date + 'T12:00:00Z') : undefined}
            onSelect={(d) => { if(d) setDate(format(d, 'yyyy-MM-dd')); setIsOpen(false); }}
            disabled={minDate ? { before: new Date(minDate + 'T12:00:00Z') } : false}
            modifiersClassNames={{
              selected: 'bg-blue-500 text-white font-bold rounded-lg',
              today: 'text-blue-400 font-bold',
            }}
            styles={{
              caption: { color: 'white', fontWeight: 'bold' },
              head_cell: { color: '#86868b' },
              cell: { color: 'white', padding: '0.2rem' }
            }}
          />
        </div>
      )}
    </div>
  );
}

