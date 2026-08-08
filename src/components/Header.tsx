import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { parseFechaLocal } from '../utils/dateUtils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenControles?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenControles }) => {
  const { getOverdueControls, selectedDate, setSelectedDate } = useClinic();
  const overdueCount = getOverdueControls().length;

  const formatHeaderDate = (dateStr: string) => {
    const dateObj = parseFechaLocal(dateStr);
    const formatted = dateObj.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <header className="bg-[#0A2A6E] text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-20 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {title || '¡Buenos días, Dra. Atoche!'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-blue-200 mt-0.5">
            <span>{subtitle || formatHeaderDate(selectedDate)}</span>
            <span className="text-blue-300/40">•</span>
            <span className="text-blue-200 font-medium">Ica, Perú</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Date simulation picker toggle for testing */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="hidden sm:block text-xs bg-blue-900/60 text-white border border-blue-400/30 rounded-lg px-2 py-1 focus:outline-none"
            title="Cambiar fecha de simulación"
          />

          <button
            onClick={onOpenControles}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-colors"
            aria-label="Notificaciones"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {overdueCount > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0A2A6E] flex items-center justify-center text-[8px] font-bold text-white">
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
