import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { parseFechaLocal, formatISO } from '../utils/dateUtils';

interface AgendaViewProps {
  onOpenAtencionModal: (pacienteId?: string) => void;
  onSelectPaciente: (pacienteId: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onOpenAtencionModal, onSelectPaciente }) => {
  const { data, selectedDate, setSelectedDate, formatSoles } = useClinic();
  const [filterCategory, setFilterCategory] = useState<'Todas' | 'Tratamientos' | 'Controles'>('Todas');

  // Generate 7 days around selectedDate for calendar strip
  const getCalendarDays = () => {
    const base = parseFechaLocal(selectedDate);
    const days = [];
    const labels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    // Start 3 days before
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const iso = formatISO(d);
      days.push({
        dateStr: iso,
        dayNum: d.getDate(),
        dayLabel: labels[d.getDay()],
        isToday: iso === selectedDate
      });
    }
    return days;
  };

  const daysStrip = getCalendarDays();

  // Filter appointments for selectedDate
  const atencionesDelDia = data.atenciones.filter(a => a.fecha === selectedDate);

  const filteredAtenciones = atencionesDelDia.filter(a => {
    if (filterCategory === 'Todas') return true;
    if (filterCategory === 'Tratamientos') return !a.observaciones?.toLowerCase().includes('control');
    if (filterCategory === 'Controles') return a.observaciones?.toLowerCase().includes('control') || a.estadoCita === 'Control';
    return true;
  });

  return (
    <div className="max-w-md mx-auto py-4 space-y-4 pb-28 animate-in fade-in duration-200">
      
      {/* Calendar Strip Header */}
      <section className="bg-white px-4 py-3 rounded-2xl shadow-xs border border-slate-200 sticky top-20 z-20">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-800 uppercase">
            {parseFechaLocal(selectedDate).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const prev = parseFechaLocal(selectedDate);
                prev.setDate(prev.getDate() - 1);
                setSelectedDate(formatISO(prev));
              }}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-600"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={() => {
                const next = parseFechaLocal(selectedDate);
                next.setDate(next.getDate() + 1);
                setSelectedDate(formatISO(next));
              }}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-600"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Day numbers strip */}
        <div className="flex justify-between items-center pt-3">
          {daysStrip.map(item => (
            <div key={item.dateStr} className="flex flex-col items-center gap-1">
              <span className={`text-[11px] font-bold ${item.isToday ? 'text-[#0A2A6E]' : 'text-slate-400'}`}>
                {item.dayLabel}
              </span>
              <button
                onClick={() => setSelectedDate(item.dateStr)}
                className={`w-9 h-9 flex flex-col items-center justify-center rounded-full text-xs font-bold transition-all relative ${
                  item.isToday
                    ? 'bg-[#0A2A6E] text-white shadow-md scale-105'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{item.dayNum}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filter Chips */}
      <section className="px-1 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          {(['Todas', 'Tratamientos', 'Controles'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-[#0A2A6E] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Vertical Timeline */}
      <section className="px-2 py-2 flex flex-col gap-4 relative">
        {/* Vertical Guide Line */}
        <div className="absolute left-[54px] top-4 bottom-4 w-0.5 bg-slate-200 z-0" />

        {filteredAtenciones.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 space-y-3 border border-slate-200 z-10">
            <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
            <p className="text-xs">No hay citas registradas para esta fecha con el filtro seleccionado.</p>
            <button
              onClick={() => onOpenAtencionModal()}
              className="bg-[#0A2A6E] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
            >
              + Agendar Nueva Cita
            </button>
          </div>
        ) : (
          filteredAtenciones.map(a => {
            const paciente = data.pacientes.find(p => p.id === a.pacienteId);

            let statusColor = 'border-l-emerald-500 text-emerald-800 bg-emerald-50';
            let statusLabel = a.estadoCita || 'Confirmada';

            if (a.metodoPago === 'Pago pendiente' || a.estadoPago === 'Deuda') {
              statusColor = 'border-l-amber-500 text-amber-800 bg-amber-50';
              statusLabel = 'Pendiente';
            } else if (a.observaciones?.toLowerCase().includes('control')) {
              statusColor = 'border-l-blue-500 text-blue-800 bg-blue-50';
              statusLabel = 'Control';
            }

            return (
              <div key={a.id} className="flex gap-4 relative z-10">
                {/* Time Label */}
                <div className="w-12 pt-2 text-right shrink-0">
                  <span className="text-xs font-bold text-slate-800 block">{a.hora}</span>
                  <span className="text-[10px] text-slate-400">45 min</span>
                </div>

                {/* Timeline Card */}
                <div className={`flex-1 bg-white rounded-2xl shadow-[0_4px_20px_rgba(10,42,110,0.04)] overflow-hidden relative border-l-4 ${statusColor.split(' ')[0]} p-4 flex flex-col gap-3 hover:border-r hover:border-r-[#2E7DD1] transition-all`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        onClick={() => paciente && onSelectPaciente(paciente.id)}
                        className="text-base font-bold text-slate-900 hover:text-[#2E7DD1] cursor-pointer"
                      >
                        {paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'Paciente'}
                      </h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-sm text-[#2E7DD1]">medical_services</span>
                        {a.tratamiento}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-400">payments</span>
                      {formatSoles(a.importe)} ({a.metodoPago})
                    </span>

                    <button
                      onClick={() => paciente && onOpenAtencionModal(paciente.id)}
                      className="text-xs text-[#2E7DD1] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Ver / Atender</span>
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* FAB Floating Add Button */}
      <button
        onClick={() => onOpenAtencionModal()}
        className="fixed bottom-24 right-4 sm:right-8 w-14 h-14 bg-[#0A2A6E] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
        title="Nueva Cita"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

    </div>
  );
};
