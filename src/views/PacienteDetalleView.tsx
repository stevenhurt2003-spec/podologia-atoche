import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Paciente } from '../types';
import { parseFechaLocal, getTodayISO } from '../utils/dateUtils';

interface PacienteDetalleViewProps {
  pacienteId: string;
  onBack: () => void;
  onOpenAtencionModal: (pacienteId: string) => void;
  onEditPaciente: (paciente: Paciente) => void;
}

export const PacienteDetalleView: React.FC<PacienteDetalleViewProps> = ({
  pacienteId,
  onBack,
  onOpenAtencionModal,
  onEditPaciente
}) => {
  const { data, formatSoles, formatFechaPeruana, markControlAsistido } = useClinic();
  const [activeTab, setActiveTab] = useState<'historial' | 'datos' | 'fotos'>('historial');

  const paciente = data.pacientes.find(p => p.id === pacienteId);

  if (!paciente) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center space-y-4">
        <p className="text-slate-600 font-semibold">Paciente no encontrado.</p>
        <button onClick={onBack} className="bg-[#0A2A6E] text-white px-4 py-2 rounded-xl text-xs">
          Regresar
        </button>
      </div>
    );
  }

  const atenciones = data.atenciones
    .filter(a => a.pacienteId === paciente.id)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Real atenciones stats (excluding solo_control)
  const realAtenciones = atenciones.filter(a => a.tipoRegistro !== 'solo_control');
  const totalAtenciones = realAtenciones.length;
  const acumuladoGasto = realAtenciones
    .filter(a => a.estadoPago === 'Pagado')
    .reduce((sum, a) => sum + a.importe, 0);

  // Overdue control logic
  const now = parseFechaLocal(getTodayISO());
  const overdueControl = atenciones.find(a => {
    if (!a.fechaProximoControl || a.controlAsistido) return false;
    const cDate = parseFechaLocal(a.fechaProximoControl);
    return cDate < now;
  });

  let daysOverdue = 0;
  if (overdueControl && overdueControl.fechaProximoControl) {
    const cDate = parseFechaLocal(overdueControl.fechaProximoControl);
    const diffTime = Math.abs(now.getTime() - cDate.getTime());
    daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Pending future control
  const pendingFutureControl = atenciones.find(a => a.fechaProximoControl && !a.controlAsistido && parseFechaLocal(a.fechaProximoControl) >= now);

  const initials = `${paciente.nombres.charAt(0)}${paciente.apellidos.charAt(0)}`.toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-28 animate-in fade-in duration-200">
      
      {/* Top Bar with Back Button */}
      <div className="bg-[#0A2A6E] text-white p-4 pt-6 rounded-b-2xl shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-200">Ficha del Paciente</h2>

          <button
            onClick={() => onEditPaciente(paciente)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Editar Paciente"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
        </div>

        {/* Patient Hero Info */}
        <div className="flex flex-col items-center text-center space-y-2 pb-2">
          <div className="w-20 h-20 rounded-full bg-white text-[#0A2A6E] font-extrabold text-2xl flex items-center justify-center border-4 border-blue-400/30 shadow-lg">
            {initials}
          </div>
          <h1 className="text-xl font-bold text-white">{paciente.nombres} {paciente.apellidos}</h1>
          <p className="text-xs text-blue-200">DNI: {paciente.dni || 'S/DNI'} • {paciente.edad} años</p>

          <div className="flex justify-center gap-3 pt-1">
            <a
              href={`tel:+51${paciente.telefono}`}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Llamar"
            >
              <span className="material-symbols-outlined text-lg">call</span>
            </a>

            <a
              href={`https://wa.me/51956965762?text=${encodeURIComponent(`Hola ${paciente.nombres}, le saludamos de Podología Clínica Atoche. Le enviamos un recordatorio sobre su atención médica.`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20bd5a] transition-transform active:scale-95 shadow-md"
              title="WhatsApp"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
            </a>
          </div>
        </div>

        {/* Stats Summary Box */}
        <div className="bg-white text-slate-800 rounded-xl p-3.5 shadow-md grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Atenciones</p>
            <p className="text-base font-bold text-[#0A2A6E]">{totalAtenciones}</p>
          </div>
          <div className="border-x border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Acumulado</p>
            <p className="text-base font-bold text-[#0A2A6E]">{formatSoles(acumuladoGasto)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Desde</p>
            <p className="text-xs font-bold text-slate-700 mt-1">{formatFechaPeruana(paciente.fechaRegistro)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        
        {/* OVERDUE CONTROL ALERT BANNER (High Priority Red Alert) */}
        {overdueControl && (
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 shadow-sm space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800 font-extrabold text-xs uppercase tracking-wide">
                <span className="material-symbols-outlined text-red-600 text-lg">warning</span>
                <span>Control Vencido ({daysOverdue} {daysOverdue === 1 ? 'día de retraso' : 'días de retraso'})</span>
              </div>
              <span className="text-xs font-bold text-red-700">
                {formatFechaPeruana(overdueControl.fechaProximoControl)}
              </span>
            </div>

            <p className="text-xs text-red-900 font-medium">
              El control post-tratamiento de este paciente se encuentra retrasado. Envíe un recordatorio directo para reprogramar la cita.
            </p>

            <div className="flex gap-2 pt-1">
              <a
                href={`https://wa.me/51956965762?text=${encodeURIComponent(`Hola ${paciente.nombres}, le saludamos de Podología Clínica Atoche. Le recordamos que su control post-tratamiento estaba programado para el ${formatFechaPeruana(overdueControl.fechaProximoControl)}. ¿Desea reprogramar su cita?`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                Enviar WhatsApp
              </a>

              <button
                onClick={() => markControlAsistido(overdueControl.id, true)}
                className="flex-1 bg-[#0A2A6E] hover:bg-[#001648] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Marcar Asistido
              </button>
            </div>
          </div>
        )}

        {/* Future Pending Control Banner */}
        {!overdueControl && pendingFutureControl && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <span className="material-symbols-outlined text-lg text-amber-600">event_upcoming</span>
                <span className="text-xs font-bold uppercase tracking-wider">Próximo Control Programado</span>
              </div>
              <span className="text-xs font-bold text-amber-900">
                {formatFechaPeruana(pendingFutureControl.fechaProximoControl)}
              </span>
            </div>

            <p className="text-xs text-amber-800">
              Cita de control post-tratamiento programada a futuro.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => markControlAsistido(pendingFutureControl.id, true)}
                className="flex-1 bg-[#0A2A6E] text-white py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#001648]"
              >
                Confirmar Asistencia Anticipada
              </button>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex border-b border-slate-200 justify-around text-xs font-bold">
          <button
            onClick={() => setActiveTab('historial')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'historial'
                ? 'border-[#0A2A6E] text-[#0A2A6E]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Historial ({atenciones.length})
          </button>

          <button
            onClick={() => setActiveTab('datos')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'datos'
                ? 'border-[#0A2A6E] text-[#0A2A6E]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Datos Clínicos
          </button>

          <button
            onClick={() => setActiveTab('fotos')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'fotos'
                ? 'border-[#0A2A6E] text-[#0A2A6E]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Fotos ({atenciones.filter(a => a.fotoPie).length})
          </button>
        </div>

        {/* Tab 1: Historial Timeline */}
        {activeTab === 'historial' && (
          <div className="space-y-4 pt-1">
            <button
              onClick={() => onOpenAtencionModal(paciente.id)}
              className="w-full bg-[#0A2A6E] text-white hover:bg-[#001648] py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              + Nueva Atención para {paciente.nombres}
            </button>

            {atenciones.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                No hay atenciones registradas aún.
              </div>
            ) : (
              <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 ml-2">
                {atenciones.map(a => {
                  const isSoloControl = a.tipoRegistro === 'solo_control';

                  return (
                    <div
                      key={a.id}
                      className={`relative bg-white rounded-2xl p-4 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border space-y-2 ${
                        isSoloControl ? 'border-purple-200 bg-purple-50/20' : 'border-slate-200'
                      }`}
                    >
                      {/* Dot on timeline */}
                      <div className={`absolute -left-[23px] top-5 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                        isSoloControl ? 'bg-purple-600' : 'bg-[#0A2A6E]'
                      }`} />

                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            {formatFechaPeruana(a.fecha)} • {a.hora}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{a.tratamiento}</h4>
                        </div>

                        {isSoloControl ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">event_repeat</span>
                            Solo control
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.estadoPago === 'Deuda' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {a.estadoPago === 'Deuda' ? 'Deuda' : 'Completado'}
                          </span>
                        )}
                      </div>

                      {!isSoloControl && (
                        <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                          <span className="font-bold text-slate-900">{formatSoles(a.importe)}</span>
                          <span>•</span>
                          <span className="font-medium">Método: {a.metodoPago}</span>
                        </div>
                      )}

                      {a.observaciones && (
                        <div className="text-xs text-slate-600 pt-1">
                          <p className="font-bold text-slate-700 text-[11px]">Notas clínicas:</p>
                          <p className="italic bg-blue-50/50 p-2 rounded-lg mt-0.5">{a.observaciones}</p>
                        </div>
                      )}

                      {a.fotoPie && (
                        <div className="pt-2">
                          <img src={a.fotoPie} alt="Pie" className="w-24 h-24 rounded-xl object-cover border border-slate-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Datos */}
        {activeTab === 'datos' && (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3 text-xs text-slate-700">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-400 font-semibold">Nombres Completos:</span>
              <span className="font-bold">{paciente.nombres} {paciente.apellidos}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-400 font-semibold">DNI:</span>
              <span className="font-bold">{paciente.dni || 'No especificado'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-400 font-semibold">Teléfono WhatsApp:</span>
              <span className="font-bold">+51 {paciente.telefono}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-400 font-semibold">Edad:</span>
              <span className="font-bold">{paciente.edad} años</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Notas Médicas Generales:</span>
              <p className="p-3 bg-slate-50 rounded-xl text-slate-800 font-medium">{paciente.notas || 'Sin antecedentes registrados.'}</p>
            </div>
          </div>
        )}

        {/* Tab 3: Fotos */}
        {activeTab === 'fotos' && (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-3">Galería Clínica del Paciente</h4>
            {atenciones.filter(a => a.fotoPie).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No hay fotografías de evolución adjuntas.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {atenciones.filter(a => a.fotoPie).map(a => (
                  <div key={a.id} className="space-y-1">
                    <img src={a.fotoPie} alt="Evolución" className="w-full h-32 rounded-xl object-cover border border-slate-300" />
                    <p className="text-[10px] text-slate-500 text-center font-medium">{formatFechaPeruana(a.fecha)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
