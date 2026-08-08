import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';

interface PacientesViewProps {
  onSelectPaciente: (pacienteId: string) => void;
  onOpenNewPacienteModal: () => void;
}

export const PacientesView: React.FC<PacientesViewProps> = ({
  onSelectPaciente,
  onOpenNewPacienteModal
}) => {
  const { data, formatFechaPeruana } = useClinic();
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<'Todos' | 'Con control pendiente' | 'Con deuda' | 'Frecuentes'>('Todos');

  // Calculate status for each patient
  const patientsWithInfo = data.pacientes.map(paciente => {
    const atenciones = data.atenciones.filter(a => a.pacienteId === paciente.id);
    const tieneDeuda = atenciones.some(a => a.estadoPago === 'Deuda' || a.metodoPago === 'Pago pendiente');
    const tieneControlPendiente = atenciones.some(a => a.fechaProximoControl && !a.controlAsistido);
    const esFrecuente = atenciones.length >= 2;

    const ultimaAtencion = atenciones.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )[0];

    return {
      paciente,
      atencionesCount: atenciones.length,
      tieneDeuda,
      tieneControlPendiente,
      esFrecuente,
      ultimaAtencion
    };
  });

  // Filter patients
  const filtered = patientsWithInfo.filter(({ paciente, tieneDeuda, tieneControlPendiente, esFrecuente }) => {
    const matchesSearch = `${paciente.nombres} ${paciente.apellidos} ${paciente.dni}`
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTag === 'Con control pendiente') return tieneControlPendiente;
    if (filterTag === 'Con deuda') return tieneDeuda;
    if (filterTag === 'Frecuentes') return esFrecuente;

    return true;
  });

  // Sort alphabetically by last name
  filtered.sort((a, b) => a.paciente.apellidos.localeCompare(b.paciente.apellidos));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 pb-28 animate-in fade-in duration-200">
      
      {/* Header info */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#0A2A6E]">Pacientes</h2>
          <p className="text-xs text-slate-500 font-medium">
            {filtered.length} {filtered.length === 1 ? 'paciente registrado' : 'pacientes registrados'}
          </p>
        </div>

        <button
          onClick={onOpenNewPacienteModal}
          className="hidden sm:flex items-center gap-1.5 bg-[#0A2A6E] hover:bg-[#001648] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Nuevo Paciente
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente por nombre, apellido o DNI..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#2E7DD1] text-sm text-slate-900 shadow-xs transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {(['Todos', 'Con control pendiente', 'Con deuda', 'Frecuentes'] as const).map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterTag === tag
                ? 'bg-[#0A2A6E] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(10,42,110,0.04)] overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500 space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">person_search</span>
            <p className="text-sm font-semibold">No se encontraron pacientes.</p>
            <p className="text-xs text-slate-400">Intenta con otro término de búsqueda o crea uno nuevo.</p>
          </div>
        ) : (
          filtered.map(({ paciente, tieneDeuda, tieneControlPendiente, ultimaAtencion }) => {
            const initials = `${paciente.nombres.charAt(0)}${paciente.apellidos.charAt(0)}`.toUpperCase();

            let statusDot = 'bg-emerald-500';
            let statusTitle = 'Al día';

            if (tieneDeuda) {
              statusDot = 'bg-red-500';
              statusTitle = 'Deuda pendiente';
            } else if (tieneControlPendiente) {
              statusDot = 'bg-blue-500';
              statusTitle = 'Control pendiente';
            }

            return (
              <div
                key={paciente.id}
                onClick={() => onSelectPaciente(paciente.id)}
                className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0A2A6E] font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200">
                    {initials}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#2E7DD1] transition-colors">
                      {paciente.nombres} {paciente.apellidos}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      DNI: {paciente.dni || 'S/DNI'} • Tel: +51 {paciente.telefono}
                    </p>
                    {ultimaAtencion && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Última atención: {formatFechaPeruana(ultimaAtencion.fecha)} ({ultimaAtencion.tratamiento})
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`${statusDot} w-3 h-3 rounded-full shrink-0`} title={statusTitle} />
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-[#2E7DD1] transition-colors">
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB Mobile Button */}
      <button
        onClick={onOpenNewPacienteModal}
        className="sm:hidden fixed bottom-24 right-4 w-14 h-14 bg-[#0A2A6E] text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-40"
        title="Nuevo Paciente"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

    </div>
  );
};
