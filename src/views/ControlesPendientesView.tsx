import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { parseFechaLocal, formatISO, getTodayISO } from '../utils/dateUtils';

interface ControlesPendientesViewProps {
  onBack: () => void;
  onSelectPaciente: (pacienteId: string) => void;
}

export const ControlesPendientesView: React.FC<ControlesPendientesViewProps> = ({
  onBack,
  onSelectPaciente
}) => {
  const {
    data,
    getOverdueControls,
    formatFechaPeruana,
    markControlAsistido,
    incrementRecordatorioEnviado,
    addPaciente,
    addAtencion
  } = useClinic();

  const overdueControls = getOverdueControls();

  const [selectedAtencionId, setSelectedAtencionId] = useState<string | null>(
    overdueControls.length > 0 ? overdueControls[0].atencion.id : null
  );

  // Modal for Independent Control Creation
  const [showModalControl, setShowModalControl] = useState(false);
  const [modePaciente, setModePaciente] = useState<'existente' | 'nuevo'>('existente');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  
  // New patient fields
  const [nuevoNombres, setNuevoNombres] = useState('');
  const [nuevoApellidos, setNuevoApellidos] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoDni, setNuevoDni] = useState('');

  // Control fields
  const [fechaControl, setFechaControl] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return formatISO(d);
  });
  const [motivoControl, setMotivoControl] = useState('');

  const selectedItem = overdueControls.find(item => item.atencion.id === selectedAtencionId) || overdueControls[0];

  const generateWhatsAppMessage = (nombre: string, fechaControlStr: string) => {
    return `Hola ${nombre}, le saludamos de Podología Clínica Atoche. Le recordamos que su control post-tratamiento estaba programado para el ${formatFechaPeruana(fechaControlStr)}. ¿Desea reprogramarlo?`;
  };

  const handleSendSingleWhatsApp = (atencionId: string, nombre: string, fechaControlStr: string) => {
    incrementRecordatorioEnviado(atencionId);
    const msg = encodeURIComponent(generateWhatsAppMessage(nombre, fechaControlStr));
    window.open(`https://wa.me/51956965762?text=${msg}`, '_blank');
  };

  const handleSendAllWhatsApp = () => {
    if (overdueControls.length === 0) return;
    overdueControls.forEach(({ atencion }) => {
      incrementRecordatorioEnviado(atencion.id);
    });
    alert(`Se actualizaron los recordatorios por WhatsApp para los ${overdueControls.length} pacientes.`);
    const first = overdueControls[0];
    const msg = encodeURIComponent(generateWhatsAppMessage(first.paciente.nombres, first.atencion.fechaProximoControl!));
    window.open(`https://wa.me/51956965762?text=${msg}`, '_blank');
  };

  const handleSaveIndependentControl = (e: React.FormEvent) => {
    e.preventDefault();
    let targetPacienteId = selectedPacienteId;

    if (modePaciente === 'nuevo') {
      if (!nuevoNombres.trim()) return;
      const created = addPaciente({
        nombres: nuevoNombres.trim(),
        apellidos: nuevoApellidos.trim(),
        telefono: nuevoTelefono.trim() || '956965762',
        dni: nuevoDni.trim() || 'S/DNI',
        edad: 30,
        notas: 'Registrado desde Control Independiente'
      });
      targetPacienteId = created.id;
    }

    if (!targetPacienteId) {
      alert('Por favor selecciona o registra un paciente.');
      return;
    }

    addAtencion({
      pacienteId: targetPacienteId,
      fecha: getTodayISO(),
      hora: '10:00',
      tratamiento: motivoControl.trim() ? `Control: ${motivoControl.trim()}` : 'Control post-tratamiento',
      importe: 0,
      metodoPago: 'Efectivo',
      estadoPago: 'Pagado',
      fechaProximoControl: fechaControl,
      controlAsistido: false,
      observaciones: motivoControl.trim() ? `Motivo: ${motivoControl.trim()}` : 'Control independiente programado',
      estadoCita: 'Confirmada',
      tipoRegistro: 'solo_control',
      recordatoriosEnviados: 0
    });

    setShowModalControl(false);
    // Reset form
    setSelectedPacienteId('');
    setPatientSearch('');
    setNuevoNombres('');
    setNuevoApellidos('');
    setNuevoTelefono('');
    setNuevoDni('');
    setMotivoControl('');
  };

  const filteredPacientes = data.pacientes.filter(p =>
    `${p.nombres} ${p.apellidos} ${p.dni}`.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="bg-[#0A2A6E] text-white p-4 pt-6 rounded-b-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div>
            <h1 className="text-lg font-bold">Controles Pendientes</h1>
            <p className="text-xs text-blue-200">Podología Clínica Atoche</p>
          </div>
        </div>

        <button
          onClick={() => setShowModalControl(true)}
          className="bg-white text-[#0A2A6E] hover:bg-blue-50 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          + Control Independiente
        </button>
      </div>

      <div className="px-4 space-y-6">

        {/* Warning Banner */}
        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-2xl p-5 shadow-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#FFECB3] rounded-full text-[#F57F17] shrink-0">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F57F17]">
                {overdueControls.length} {overdueControls.length === 1 ? 'paciente con control atrasado' : 'pacientes con control atrasado'}
              </h2>
              <p className="text-xs text-amber-900 mt-0.5">
                Revise la lista ordenada por tiempo de retraso y gestione el seguimiento.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModalControl(true)}
            className="hidden sm:flex bg-[#0A2A6E] text-white px-3.5 py-2 rounded-xl text-xs font-bold items-center gap-1 shadow-xs hover:bg-[#001648] shrink-0"
          >
            <span className="material-symbols-outlined text-sm">event</span>
            Programar Control
          </button>
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Patient Cards List */}
          <div className="lg:col-span-2 space-y-4">
            {overdueControls.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200 space-y-3">
                <span className="material-symbols-outlined text-4xl text-emerald-500">verified</span>
                <p className="text-sm font-bold text-slate-800">¡Todos los controles al día!</p>
                <p className="text-xs text-slate-400">No hay pacientes con citas atrasadas en este momento.</p>
                <button
                  onClick={() => setShowModalControl(true)}
                  className="inline-flex items-center gap-1.5 bg-[#0A2A6E] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#001648]"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Registrar nuevo control pendiente
                </button>
              </div>
            ) : (
              overdueControls.map(({ atencion, paciente, diasRetraso }) => {
                const isSelected = selectedAtencionId === atencion.id;
                const initials = `${paciente.nombres.charAt(0)}${paciente.apellidos.charAt(0)}`.toUpperCase();

                // Color coding according to delay age:
                // Amber (1 to 7 days)
                // Red (8 to 30 days)
                // Dark Gray / Black (31+ days: Paciente Perdido)
                let cardBorderClass = 'border-amber-300';
                let badgeClass = 'bg-amber-100 text-amber-900 border border-amber-300';
                let tagText = `${diasRetraso} ${diasRetraso === 1 ? 'día' : 'días'} (Alerta reciente)`;

                if (diasRetraso >= 8 && diasRetraso <= 30) {
                  cardBorderClass = 'border-red-300';
                  badgeClass = 'bg-red-100 text-red-700 border border-red-300';
                  tagText = `${diasRetraso} días de retraso`;
                } else if (diasRetraso > 30) {
                  cardBorderClass = 'border-slate-500 bg-slate-50/30';
                  badgeClass = 'bg-slate-800 text-white font-extrabold';
                  tagText = `${diasRetraso} días • PACIENTE PERDIDO`;
                }

                return (
                  <div
                    key={atencion.id}
                    onClick={() => setSelectedAtencionId(atencion.id)}
                    className={`bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border-2 transition-all cursor-pointer ${cardBorderClass} ${
                      isSelected ? 'ring-2 ring-[#2E7DD1]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#0A2A6E] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectPaciente(paciente.id);
                              }}
                              className="text-base font-bold text-slate-900 hover:text-[#2E7DD1]"
                            >
                              {paciente.nombres} {paciente.apellidos}
                            </h3>
                            {atencion.tipoRegistro === 'solo_control' && (
                              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                                Solo control
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{atencion.tratamiento}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">chat</span>
                            {atencion.recordatoriosEnviados || 0} {atencion.recordatoriosEnviados === 1 ? 'recordatorio enviado' : 'recordatorios enviados'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 justify-end">
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          {formatFechaPeruana(atencion.fechaProximoControl)}
                        </p>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                          {tagText}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendSingleWhatsApp(atencion.id, paciente.nombres, atencion.fechaProximoControl!);
                        }}
                        className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        Enviar WhatsApp
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markControlAsistido(atencion.id, true);
                        }}
                        className="flex-1 border border-[#0A2A6E] text-[#0A2A6E] hover:bg-blue-50 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Marcar Asistido
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Preview Box Sidebar */}
          {selectedItem && (
            <div className="lg:col-span-1">
              <div className="bg-slate-100 rounded-2xl p-5 sticky top-24 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-[#0A2A6E] font-bold text-sm">
                  <span className="material-symbols-outlined">preview</span>
                  <h3>Vista previa del mensaje</h3>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 relative shadow-xs text-xs text-slate-800 leading-relaxed italic">
                  "{generateWhatsAppMessage(selectedItem.paciente.nombres, selectedItem.atencion.fechaProximoControl!)}"
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 text-center">
                  <p>Este mensaje se personaliza automáticamente para cada paciente.</p>
                  <p className="font-bold text-[#0A2A6E]">
                    Recordatorios enviados: {selectedItem.atencion.recordatoriosEnviados || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sticky Mass Action Button */}
        {overdueControls.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 backdrop-blur-xs border-t border-slate-200 z-30">
            <div className="max-w-4xl mx-auto flex gap-3">
              <button
                onClick={handleSendAllWhatsApp}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-xl">chat</span>
                Enviar recordatorio a todos ({overdueControls.length})
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Independent Control Registration Modal */}
      {showModalControl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#0A2A6E]">
                <span className="material-symbols-outlined text-2xl">event_upcoming</span>
                <h3 className="text-base font-bold">Registrar Control Independiente</h3>
              </div>
              <button
                onClick={() => setShowModalControl(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveIndependentControl} className="space-y-4 text-xs">
              
              {/* Paciente Type selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl font-bold">
                <button
                  type="button"
                  onClick={() => setModePaciente('existente')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    modePaciente === 'existente' ? 'bg-[#0A2A6E] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Paciente Existente
                </button>
                <button
                  type="button"
                  onClick={() => setModePaciente('nuevo')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    modePaciente === 'nuevo' ? 'bg-[#0A2A6E] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  + Nuevo Paciente
                </button>
              </div>

              {modePaciente === 'existente' ? (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Buscar paciente registrado</label>
                  <input
                    type="text"
                    placeholder="Escriba nombre o DNI..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2E7DD1]"
                  />

                  <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 bg-slate-50">
                    {filteredPacientes.length === 0 ? (
                      <p className="p-3 text-slate-400 text-center">No se encontraron pacientes.</p>
                    ) : (
                      filteredPacientes.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPacienteId(p.id);
                            setPatientSearch(`${p.nombres} ${p.apellidos}`);
                          }}
                          className={`w-full text-left p-2.5 transition-colors flex justify-between items-center ${
                            selectedPacienteId === p.id ? 'bg-blue-100/80 font-bold text-[#0A2A6E]' : 'hover:bg-white'
                          }`}
                        >
                          <span>{p.nombres} {p.apellidos}</span>
                          <span className="text-[10px] text-slate-400">DNI: {p.dni}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Nombres *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nombres"
                        value={nuevoNombres}
                        onChange={(e) => setNuevoNombres(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Apellidos</label>
                      <input
                        type="text"
                        placeholder="Apellidos"
                        value={nuevoApellidos}
                        onChange={(e) => setNuevoApellidos(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Teléfono WhatsApp</label>
                      <input
                        type="text"
                        placeholder="956965762"
                        value={nuevoTelefono}
                        onChange={(e) => setNuevoTelefono(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">DNI</label>
                      <input
                        type="text"
                        placeholder="87654321"
                        value={nuevoDni}
                        onChange={(e) => setNuevoDni(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Fecha de control con botones de intervalo */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Fecha del control *</label>
                
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '7 días', days: 7 },
                    { label: '15 días', days: 15 },
                    { label: '1 mes', days: 30 },
                    { label: '3 meses', days: 90 }
                  ].map(interval => (
                    <button
                      key={interval.label}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + interval.days);
                        setFechaControl(formatISO(d));
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-[#0A2A6E] bg-slate-50 hover:bg-blue-50"
                    >
                      + {interval.label}
                    </button>
                  ))}
                </div>

                <input
                  type="date"
                  required
                  value={fechaControl}
                  onChange={(e) => setFechaControl(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              {/* Motivo opcional */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo del control (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej.: Revisión de curación uñero, evaluación de micosis"
                  value={motivoControl}
                  onChange={(e) => setMotivoControl(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalControl(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0A2A6E] hover:bg-[#001648] text-white font-bold shadow-xs"
                >
                  Guardar control
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
