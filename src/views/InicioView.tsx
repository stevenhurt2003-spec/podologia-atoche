import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { Atencion, Paciente } from '../types';

interface InicioViewProps {
  onOpenAtencionModal: (pacienteId?: string) => void;
  onOpenPacienteModal: () => void;
  onSelectPaciente: (pacienteId: string) => void;
  onOpenControlesView: () => void;
  onNavigateTab: (tab: 'agenda' | 'pacientes' | 'ingresos' | 'ajustes' | 'controles') => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
  onOpenAtencionModal,
  onOpenPacienteModal,
  onSelectPaciente,
  onOpenControlesView,
  onNavigateTab
}) => {
  const { data, selectedDate, formatSoles, getOverdueControls } = useClinic();

  // Atenciones de hoy (excluyendo registros de solo_control para conteos e ingresos)
  const atencionesHoy = data.atenciones.filter(a => a.fecha === selectedDate);
  const atencionesRealesHoy = atencionesHoy.filter(a => a.tipoRegistro !== 'solo_control');

  // 1. Ingresos de hoy (pagados)
  const ingresosHoy = atencionesRealesHoy
    .filter(a => a.estadoPago === 'Pagado')
    .reduce((sum, a) => sum + a.importe, 0);

  // 2. Número de atenciones de hoy
  const numeroAtencionesHoy = atencionesRealesHoy.length;

  // 3. Por cobrar (Total de deuda acumulado en el sistema)
  const porCobrarTotal = data.atenciones
    .filter(a => a.tipoRegistro !== 'solo_control' && (a.estadoPago === 'Deuda' || a.metodoPago === 'Pago pendiente'))
    .reduce((sum, a) => sum + a.importe, 0);

  // 4. Controles no asistidos (atrazados)
  const overdueControls = getOverdueControls();
  const controlesNoAsistidosCount = overdueControls.length;

  // Format time properly (e.g. "09:00 a. m." or "02:30 p. m.")
  const formatHoraPeruana = (horaStr: string) => {
    if (!horaStr) return '';
    if (horaStr.toLowerCase().includes('a. m.') || horaStr.toLowerCase().includes('p. m.')) {
      return horaStr;
    }
    const clean = horaStr.trim();
    const parts = clean.replace(/[^0-9:]/g, '').split(':');
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      const m = parts[1].padStart(2, '0');
      const isExplicitPM = /pm/i.test(clean);
      const isExplicitAM = /am/i.test(clean);
      let isPM = false;
      if (isExplicitPM) {
        isPM = true;
      } else if (!isExplicitAM && h >= 12) {
        isPM = true;
      }
      if (h > 12) {
        h = h - 12;
      } else if (h === 0) {
        h = 12;
      }
      const hStr = String(h).padStart(2, '0');
      return `${hStr}:${m} ${isPM ? 'p. m.' : 'a. m.'}`;
    }
    return horaStr;
  };

  // Próxima cita de hoy (ejemplo: la primera cita no completada de hoy o primera cita)
  const proximaCita = atencionesHoy.length > 0 ? atencionesHoy[0] : null;
  const pacienteProximaCita = proximaCita
    ? data.pacientes.find(p => p.id === proximaCita.pacienteId)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28 animate-in fade-in duration-200">
      
      {/* KPI Section Grid (4 Cards) */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        
        {/* KPI 1: Ingresos de hoy */}
        <div
          onClick={() => onNavigateTab('ingresos')}
          className="bg-white rounded-[16px] p-4 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-transparent hover:border-[#2E7DD1] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-slate-500 mb-2 group-hover:text-[#2E7DD1] transition-colors">
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Ingresos hoy</span>
          </div>
          <p className="text-xl sm:text-2xl text-[#0A2A6E] font-extrabold tracking-tight">
            {formatSoles(ingresosHoy)}
          </p>
        </div>

        {/* KPI 2: Atenciones de hoy */}
        <div
          onClick={() => onNavigateTab('agenda')}
          className="bg-white rounded-[16px] p-4 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-transparent hover:border-[#2E7DD1] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-slate-500 mb-2 group-hover:text-[#2E7DD1] transition-colors">
            <span className="material-symbols-outlined text-lg">medication</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Citas hoy</span>
          </div>
          <p className="text-xl sm:text-2xl text-[#0A2A6E] font-extrabold tracking-tight">
            {numeroAtencionesHoy} {numeroAtencionesHoy === 1 ? 'paciente' : 'pacientes'}
          </p>
        </div>

        {/* KPI 3: Por cobrar */}
        <div
          onClick={() => onNavigateTab('ingresos')}
          className="bg-white rounded-[16px] p-4 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-transparent hover:border-amber-500 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-slate-500 mb-2 group-hover:text-amber-600 transition-colors">
            <span className="material-symbols-outlined text-lg text-amber-500">schedule</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Por cobrar</span>
          </div>
          <p className="text-xl sm:text-2xl text-amber-600 font-extrabold tracking-tight">
            {formatSoles(porCobrarTotal)}
          </p>
        </div>

        {/* KPI 4: Controles no asistidos */}
        <div
          onClick={onOpenControlesView}
          className="bg-white rounded-[16px] p-4 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-transparent hover:border-red-500 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-slate-500 mb-2 group-hover:text-red-600 transition-colors">
            <span className="material-symbols-outlined text-lg text-red-500">warning</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Sin control</span>
          </div>
          <p className="text-xl sm:text-2xl text-red-600 font-extrabold tracking-tight">
            {controlesNoAsistidosCount} {controlesNoAsistidosCount === 1 ? 'paciente' : 'pacientes'}
          </p>
        </div>

      </section>

      {/* Hero: Próxima Cita */}
      <section className="bg-[#0A2A6E] text-white rounded-[20px] p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-bl-full pointer-events-none" />
        <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3">Próxima Cita</p>
        
        {proximaCita && pacienteProximaCita ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-800 text-blue-100 flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <div>
                <p className="text-xs text-blue-200 font-medium">{formatHoraPeruana(proximaCita.hora)}</p>
                <h3 className="text-lg font-bold text-white">{pacienteProximaCita.nombres} {pacienteProximaCita.apellidos}</h3>
                <p className="text-xs text-blue-100/90 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-xs">medical_services</span>
                  {proximaCita.tratamiento}
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenAtencionModal(pacienteProximaCita.id)}
              className="w-full bg-white hover:bg-blue-50 text-[#0A2A6E] font-bold py-3 rounded-xl text-sm transition-all shadow-sm active:scale-[0.99]"
            >
              Atender Ahora
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-blue-100">No hay más citas programadas para el día de hoy.</p>
            <button
              onClick={() => onOpenAtencionModal()}
              className="inline-block bg-white text-[#0A2A6E] font-bold px-5 py-2 rounded-xl text-xs"
            >
              + Registrar Nueva Atención
            </button>
          </div>
        )}
      </section>

      {/* Agenda de Hoy */}
      <section className="space-y-3">
        <div className="flex justify-between items-end">
          <h3 className="text-base font-bold text-[#0A2A6E]">Agenda de Hoy</h3>
          <button
            onClick={() => onNavigateTab('agenda')}
            className="text-[#2E7DD1] text-xs font-semibold hover:underline"
          >
            Ver todo
          </button>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(10,42,110,0.04)] divide-y divide-slate-100 overflow-hidden">
          {atencionesHoy.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No hay atenciones registradas para esta fecha.
            </div>
          ) : (
            atencionesHoy.slice(0, 4).map(a => {
              const p = data.pacientes.find(item => item.id === a.pacienteId);
              const isDeuda = a.estadoPago === 'Deuda' || a.metodoPago === 'Pago pendiente';

              return (
                <div key={a.id} className="p-4 hover:bg-slate-50 transition-colors space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-14 text-right">{a.hora}</span>
                      <div>
                        <h4
                          onClick={() => p && onSelectPaciente(p.id)}
                          className="text-sm font-bold text-slate-900 hover:text-[#2E7DD1] cursor-pointer"
                        >
                          {p ? `${p.nombres} ${p.apellidos}` : 'Paciente Desconocido'}
                        </h4>
                        <p className="text-xs text-slate-500">{a.tratamiento}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      isDeuda
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isDeuda ? `DEUDA S/${a.importe}` : 'PAGADO'}
                    </span>
                  </div>

                  <div className="pl-17 flex gap-2">
                    <button
                      onClick={() => p && onOpenAtencionModal(p.id)}
                      className="w-full border border-[#2E7DD1] text-[#2E7DD1] hover:bg-blue-50 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">stethoscope</span>
                      Atender
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Requieren seguimiento / Controles retrasados */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#0A2A6E]">Requieren seguimiento</h3>
          {overdueControls.length > 0 && (
            <button
              onClick={onOpenControlesView}
              className="text-[#2E7DD1] text-xs font-semibold hover:underline"
            >
              Ver todos ({overdueControls.length})
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {overdueControls.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              Todos los controles están al día. ¡Excelente seguimiento!
            </div>
          ) : (
            overdueControls.slice(0, 3).map(({ atencion, paciente, diasRetraso }) => {
              const msg = encodeURIComponent(
                `Hola ${paciente.nombres}, le saludamos de Podología Clínica Atoche. Le recordamos que su control post-tratamiento estaba programado para el ${atencion.fechaProximoControl}. ¿Desea reprogramar su cita?`
              );

              return (
                <div
                  key={atencion.id}
                  className="bg-white rounded-[16px] p-4 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border-l-4 border-l-red-500 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4
                      onClick={() => onSelectPaciente(paciente.id)}
                      className="text-sm font-bold text-slate-900 hover:text-[#2E7DD1] cursor-pointer"
                    >
                      {paciente.nombres} {paciente.apellidos}
                    </h4>
                    <p className="text-xs text-red-600 font-medium">
                      No asistió a control ({diasRetraso} {diasRetraso === 1 ? 'día' : 'días'} de retraso)
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/51956965762?text=${msg}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    Recordar
                  </a>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Quick Actions Buttons */}
      <section className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onOpenPacienteModal}
            className="w-full bg-[#0A2A6E] text-white hover:bg-[#001648] py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            + Nuevo Paciente
          </button>

          <button
            onClick={() => onOpenAtencionModal()}
            className="w-full bg-white text-[#0A2A6E] border-2 border-[#0A2A6E] hover:bg-blue-50 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            Registrar Atención
          </button>
        </div>
      </section>

    </div>
  );
};
