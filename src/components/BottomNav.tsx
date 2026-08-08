import React from 'react';
import { useClinic } from '../context/ClinicContext';

export type TabType = 'inicio' | 'agenda' | 'pacientes' | 'ingresos' | 'ajustes' | 'controles';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { getOverdueControls } = useClinic();
  const overdueCount = getOverdueControls().length;

  const navItems: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar_today' },
    { id: 'pacientes', label: 'Pacientes', icon: 'groups' },
    { id: 'ingresos', label: 'Ingresos', icon: 'payments' },
    { id: 'ajustes', label: 'Ajustes', icon: 'settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white border-t border-slate-200 shadow-[0px_-4px_20px_rgba(10,42,110,0.06)] h-20 px-2 pb-2 flex justify-around items-center">
      {navItems.map(item => {
        const isActive = currentTab === item.id || (item.id === 'agenda' && currentTab === 'controles');
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all duration-200 relative ${
              isActive
                ? 'bg-[#0A2A6E] text-white shadow-sm font-semibold scale-100'
                : 'text-slate-600 hover:text-[#0A2A6E] hover:bg-slate-50'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] ${
                isActive ? 'fill' : ''
              }`}
            >
              {item.icon}
            </span>
            <span className="text-[11px] mt-0.5 tracking-tight font-medium">
              {item.label}
            </span>

            {/* Overdue control badge on Agenda or Inicio if count > 0 */}
            {item.id === 'agenda' && overdueCount > 0 && !isActive && (
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
