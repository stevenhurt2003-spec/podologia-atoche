import React, { useState, useEffect, useRef } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Paciente, MetodoPago, Tarifa } from '../types';
import { parseFechaLocal, formatISO } from '../utils/dateUtils';

interface AtencionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPacienteId?: string;
  onOpenNewPacienteModal?: () => void;
}

const CATEGORIAS_ORDEN = [
  'Diagnóstico',
  'Limpieza y profilaxis',
  'Tratamientos de uña',
  'Ortopodología',
  'Estética y cuidado'
];

const MAPA_CATEGORIAS: Record<string, string> = {
  'Consulta podológica': 'Diagnóstico',
  'Pedigrafía / Huella plantar': 'Diagnóstico',

  'Profilaxis podológica (limpieza básica)': 'Limpieza y profilaxis',
  'Podología profunda': 'Limpieza y profilaxis',
  'Limpieza de uñas': 'Limpieza y profilaxis',
  'Limpieza de piel plantar': 'Limpieza y profilaxis',
  'Exfoliación podal': 'Limpieza y profilaxis',
  'Hidratación profunda con parafina': 'Limpieza y profilaxis',

  'Extracción de uña encarnada (uñero)': 'Tratamientos de uña',
  'Tratamiento de onicocriptosis': 'Tratamientos de uña',
  'Fenolización de uña': 'Tratamientos de uña',
  'Reconstrucción de uñas (acrílico medicinal)': 'Tratamientos de uña',
  'Tratamiento de onicomicosis (hongos)': 'Tratamientos de uña',
  'Láser para onicomicosis': 'Tratamientos de uña',
  'Brackets podológicos': 'Tratamientos de uña',
  'Fibra molecular': 'Tratamientos de uña',
  'Curación y control postoperatorio': 'Tratamientos de uña',

  'Ortesis de silicona': 'Ortopodología',
  'Plantillas ortopédicas personalizadas': 'Ortopodología',

  'Tratamiento integral del pie': 'Estética y cuidado',
  'Reflexología podal': 'Estética y cuidado'
};

export const AtencionFormModal: React.FC<AtencionFormModalProps> = ({
  isOpen,
  onClose,
  initialPacienteId,
  onOpenNewPacienteModal
}) => {
  const { data, addAtencion, selectedDate, formatSoles } = useClinic();

  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(initialPacienteId || '');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPacienteDropdownOpen, setIsPacienteDropdownOpen] = useState<boolean>(false);

  const [fecha, setFecha] = useState<string>(selectedDate);
  const [hora, setHora] = useState<string>('10:30');

  // Treatment state & searchable dropdown state
  const [tratamiento, setTratamiento] = useState<string>('Profilaxis podológica (limpieza básica)');
  const [tratamientoFilter, setTratamientoFilter] = useState<string>('');
  const [isTratamientoDropdownOpen, setIsTratamientoDropdownOpen] = useState<boolean>(false);

  // Importe state (string or number to allow empty string input)
  const [importe, setImporte] = useState<number | string>(55);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Yape');

  const [programarSeguimiento, setProgramarSeguimiento] = useState<boolean>(true);
  const [fechaProximoControl, setFechaProximoControl] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [fotoPie, setFotoPie] = useState<string | undefined>(undefined);

  const tratamientoDropdownRef = useRef<HTMLDivElement>(null);

  // Sync initial patient if passed
  useEffect(() => {
    if (initialPacienteId) {
      setSelectedPacienteId(initialPacienteId);
      const p = data.pacientes.find(item => item.id === initialPacienteId);
      if (p) setSearchTerm(`${p.nombres} ${p.apellidos}`);
    }
  }, [initialPacienteId, data.pacientes]);

  // Default next control date to 14 days after selected fecha
  useEffect(() => {
    if (fecha) {
      const d = parseFechaLocal(fecha);
      d.setDate(d.getDate() + 14);
      setFechaProximoControl(formatISO(d));
    }
  }, [fecha]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tratamientoDropdownRef.current &&
        !tratamientoDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTratamientoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected treatment tariff object
  const selectedTarifa = data.tarifas.find(
    t => t.tratamiento.toLowerCase() === tratamiento.toLowerCase()
  );

  // Handle treatment selection
  const handleSelectTratamiento = (t: Tarifa) => {
    setTratamiento(t.tratamiento);
    setImporte(t.precioSugerido);
    setIsTratamientoDropdownOpen(false);
    setTratamientoFilter('');
  };

  // Filter and group treatments by category
  const getCategorizedTarifas = () => {
    const filterLower = tratamientoFilter.toLowerCase().trim();
    const filtered = data.tarifas.filter(t =>
      t.tratamiento.toLowerCase().includes(filterLower) ||
      (t.descripcion && t.descripcion.toLowerCase().includes(filterLower))
    );

    const groups: { categoria: string; tarifas: Tarifa[] }[] = [];

    CATEGORIAS_ORDEN.forEach(catName => {
      const catTarifas = filtered.filter(
        t => MAPA_CATEGORIAS[t.tratamiento] === catName
      );
      if (catTarifas.length > 0) {
        groups.push({ categoria: catName, tarifas: catTarifas });
      }
    });

    // Unmapped/custom items go to 'Otros'
    const unmapped = filtered.filter(t => !MAPA_CATEGORIAS[t.tratamiento]);
    if (unmapped.length > 0) {
      groups.push({ categoria: 'Otros', tarifas: unmapped });
    }

    return groups;
  };

  // Validation logic for Importe
  const numImporte = typeof importe === 'number' ? importe : parseFloat(importe);
  const isImporteInvalid = isNaN(numImporte) || numImporte <= 0;

  // Check if amount is outside the reference range
  const isOutOfRange =
    !isImporteInvalid &&
    selectedTarifa !== undefined &&
    (numImporte < selectedTarifa.precioMin || numImporte > selectedTarifa.precioMax);

  const selectedPaciente = data.pacientes.find(p => p.id === selectedPacienteId);

  const filteredPacientes = data.pacientes.filter(p => {
    const full = `${p.nombres} ${p.apellidos} ${p.dni}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  const handleSave = (sendWhatsApp: boolean = false) => {
    if (!selectedPacienteId) {
      alert('Por favor selecciona o registra un paciente.');
      return;
    }

    if (isImporteInvalid) {
      return;
    }

    const estadoPago = metodoPago === 'Pago pendiente' ? 'Deuda' : 'Pagado';

    addAtencion({
      pacienteId: selectedPacienteId,
      fecha,
      hora,
      tratamiento,
      importe: numImporte,
      metodoPago,
      estadoPago,
      fechaProximoControl: programarSeguimiento ? fechaProximoControl : undefined,
      controlAsistido: false,
      observaciones,
      fotoPie,
      estadoCita: 'Confirmada'
    });

    if (sendWhatsApp && selectedPaciente) {
      const msg = encodeURIComponent(
        `Hola ${selectedPaciente.nombres}, le saludamos de Podología Clínica Atoche. Confirmamos el registro de su atención (${tratamiento}) realizada el ${fecha}. ${
          programarSeguimiento && fechaProximoControl
            ? `Su próximo control está programado para el ${fechaProximoControl}.`
            : ''
        } ¡Gracias por su confianza!`
      );
      window.open(`https://wa.me/51956965762?text=${msg}`, '_blank');
    }

    onClose();
  };

  if (!isOpen) return null;

  const categorizedTarifas = getCategorizedTarifas();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center overflow-y-auto p-0 sm:p-4">
      <div className="bg-[#F5F7FA] w-full max-w-2xl max-h-[92vh] sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <header className="bg-white px-6 py-4 shadow-xs flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-slate-600 hover:text-[#0A2A6E] hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-lg font-bold text-[#0A2A6E] absolute left-1/2 -translate-x-1/2">
            Registrar atención
          </h2>
          <div className="w-8"></div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28">
          
          {/* Section 1: Paciente */}
          <section className="bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] space-y-3">
            <h3 className="text-base font-bold text-[#0A2A6E]">Paciente</h3>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400">search</span>
              </div>
              <input
                type="text"
                placeholder="Buscar paciente por nombre o DNI"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsPacienteDropdownOpen(true);
                }}
                onFocus={() => setIsPacienteDropdownOpen(true)}
                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1] focus:ring-1 focus:ring-[#2E7DD1] transition-colors"
              />

              {/* Patient Dropdown */}
              {isPacienteDropdownOpen && filteredPacientes.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {filteredPacientes.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPacienteId(p.id);
                        setSearchTerm(`${p.nombres} ${p.apellidos}`);
                        setIsPacienteDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{p.nombres} {p.apellidos}</p>
                        <p className="text-xs text-slate-500">DNI: {p.dni} • Tel: {p.telefono}</p>
                      </div>
                      <span className="text-xs font-medium text-[#2E7DD1]">Seleccionar</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedPaciente && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-[#0A2A6E]">{selectedPaciente.nombres} {selectedPaciente.apellidos}</p>
                  <p className="text-xs text-slate-600">DNI: {selectedPaciente.dni} • Edad: {selectedPaciente.edad} años</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPacienteId('');
                    setSearchTerm('');
                  }}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Cambiar
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (onOpenNewPacienteModal) onOpenNewPacienteModal();
              }}
              className="text-[#2E7DD1] font-semibold text-xs hover:underline flex items-center gap-1 pt-1"
            >
              + Registrar paciente nuevo
            </button>
          </section>

          {/* Section 2: Atención */}
          <section className="bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] space-y-4">
            <h3 className="text-base font-bold text-[#0A2A6E]">Atención</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                  </div>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hora</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">schedule</span>
                  </div>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1]"
                  />
                </div>
              </div>
            </div>

            {/* Categorized & Searchable Dropdown for Tratamiento */}
            <div className="relative" ref={tratamientoDropdownRef}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tratamiento realizado</label>
              
              <button
                type="button"
                onClick={() => setIsTratamientoDropdownOpen(!isTratamientoDropdownOpen)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#2E7DD1] text-left flex justify-between items-center shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block leading-snug">{tratamiento}</span>
                  {selectedTarifa && (
                    <span className="text-xs text-slate-500 font-normal">
                      Sugerido: {formatSoles(selectedTarifa.precioSugerido)} (Rango: S/ {selectedTarifa.precioMin} – S/ {selectedTarifa.precioMax})
                    </span>
                  )}
                </div>
                <span className="material-symbols-outlined text-slate-400 text-lg">
                  {isTratamientoDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isTratamientoDropdownOpen && (
                <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-80 flex flex-col overflow-hidden animate-in fade-in duration-150">
                  {/* Search Input inside Dropdown */}
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-sm">search</span>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar por nombre de tratamiento..."
                        value={tratamientoFilter}
                        onChange={(e) => setTratamientoFilter(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#2E7DD1]"
                      />
                    </div>
                  </div>

                  {/* Grouped Options List */}
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                    {categorizedTarifas.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No se encontraron tratamientos con ese nombre.
                      </div>
                    ) : (
                      categorizedTarifas.map(group => (
                        <div key={group.categoria} className="bg-white">
                          <div className="px-3 py-1.5 bg-slate-100/80 text-[10px] font-bold text-[#0A2A6E] uppercase tracking-wider sticky top-0">
                            {group.categoria}
                          </div>

                          <div className="divide-y divide-slate-50">
                            {group.tarifas.map(t => {
                              const isSelected = t.tratamiento.toLowerCase() === tratamiento.toLowerCase();
                              return (
                                <button
                                  key={t.id || t.tratamiento}
                                  type="button"
                                  onClick={() => handleSelectTratamiento(t)}
                                  className={`w-full text-left px-3.5 py-2.5 transition-colors flex justify-between items-center ${
                                    isSelected ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="pr-2">
                                    <p className={`text-xs ${isSelected ? 'text-[#0A2A6E] font-bold' : 'text-slate-800 font-semibold'}`}>
                                      {t.tratamiento} {t.porSesion && <span className="text-[10px] font-normal text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full ml-1">por sesión</span>}
                                    </p>
                                    {t.descripcion && (
                                      <p className="text-[11px] text-slate-400 line-clamp-1">{t.descripcion}</p>
                                    )}
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-bold text-[#0A2A6E] block">
                                      {formatSoles(t.precioSugerido)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      S/ {t.precioMin} – {t.precioMax}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Monto a cobrar & Precio Libre */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-600">Monto a cobrar</label>
                <button
                  type="button"
                  onClick={() => setImporte('')}
                  className="text-xs font-semibold text-[#2E7DD1] hover:underline flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-xs">edit_note</span>
                  Precio libre
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500 font-semibold text-sm">S/</span>
                <input
                  type="number"
                  step="0.50"
                  value={importe}
                  onChange={(e) => setImporte(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-bold text-slate-900 focus:outline-none transition-colors ${
                    isImporteInvalid
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                      : isOutOfRange
                      ? 'border-amber-400 bg-amber-50/20 focus:border-amber-500'
                      : 'border-slate-200 focus:border-[#2E7DD1]'
                  }`}
                />
              </div>

              {/* Reference range small gray text */}
              {selectedTarifa && (
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Rango referencial: S/ {selectedTarifa.precioMin} – S/ {selectedTarifa.precioMax}
                </p>
              )}

              {/* Invalid amount red notice */}
              {isImporteInvalid && (
                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-xs font-semibold mt-2">
                  <span className="material-symbols-outlined text-sm text-red-500">error</span>
                  <span>Ingrese un importe válido</span>
                </div>
              )}

              {/* Out of range amber notice (allows saving) */}
              {!isImporteInvalid && isOutOfRange && (
                <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs font-medium mt-2">
                  <span className="material-symbols-outlined text-sm text-amber-600">warning</span>
                  <span>Monto fuera del rango referencial</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Método de pago</label>
              <div className="flex flex-wrap gap-2">
                {(['Efectivo', 'Yape', 'Plin', 'Transferencia', 'Tarjeta', 'Pago pendiente'] as MetodoPago[]).map((met) => {
                  const isSelected = metodoPago === met;
                  let colorClass = 'border-slate-200 text-slate-700 hover:bg-slate-100';
                  
                  if (isSelected) {
                    if (met === 'Yape') colorClass = 'bg-[#6C157C] text-white border-[#6C157C] shadow-sm';
                    else if (met === 'Pago pendiente') colorClass = 'bg-amber-500 text-white border-amber-500 shadow-sm';
                    else colorClass = 'bg-[#0A2A6E] text-white border-[#0A2A6E] shadow-sm';
                  }

                  return (
                    <button
                      key={met}
                      type="button"
                      onClick={() => setMetodoPago(met)}
                      className={`px-3.5 py-2 rounded-full border text-xs font-medium transition-all ${colorClass}`}
                    >
                      {met}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 3: Seguimiento */}
          <section className="bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#0A2A6E]">Seguimiento</h3>
                <p className="text-xs text-slate-500">Programar control post-tratamiento</p>
              </div>
              
              {/* Custom Switch Toggle */}
              <button
                type="button"
                onClick={() => setProgramarSeguimiento(!programarSeguimiento)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                  programarSeguimiento ? 'bg-[#0A2A6E]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    programarSeguimiento ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {programarSeguimiento && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-slate-600">Próxima cita (Control)</label>
                
                {/* Quick Interval Buttons */}
                <div className="flex flex-wrap gap-2">
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
                        const baseDate = fecha ? parseFechaLocal(fecha) : new Date();
                        baseDate.setDate(baseDate.getDate() + interval.days);
                        setFechaProximoControl(formatISO(baseDate));
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-[#0A2A6E] bg-slate-50 hover:bg-blue-50 hover:border-[#2E7DD1] transition-colors"
                    >
                      + {interval.label}
                    </button>
                  ))}
                </div>

                <div className="relative pt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-1 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_month</span>
                  </div>
                  <input
                    type="date"
                    value={fechaProximoControl}
                    onChange={(e) => setFechaProximoControl(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors ${
                      programarSeguimiento && fechaProximoControl && fechaProximoControl < fecha
                        ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                        : 'border-slate-200 focus:border-[#2E7DD1]'
                    }`}
                  />
                </div>

                {programarSeguimiento && fechaProximoControl && fechaProximoControl < fecha && (
                  <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-xs font-semibold">
                    <span className="material-symbols-outlined text-sm text-red-500">error</span>
                    <span>La fecha del próximo control no puede ser anterior a la fecha de la atención</span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Observaciones clínicas</label>
              <textarea
                rows={3}
                placeholder="Ej.: Resección de espícula lateral, indicar amoxicilina y cura diaria."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Fotografía del pie (opcional)</label>
              <input
                type="file"
                accept="image/*"
                id="foto-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFotoPie(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {fotoPie ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-300">
                  <img src={fotoPie} alt="Pie" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFotoPie(undefined)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="foto-upload"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-[#2E7DD1] text-[#2E7DD1] rounded-xl font-medium text-xs hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  Adjuntar fotografía del pie
                </label>
              )}
            </div>
          </section>

        </div>

        {/* Footer Fixed Action Bar */}
        <footer className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20 space-y-2 shadow-lg">
          {(() => {
            const isControlDateInvalid = programarSeguimiento && Boolean(fechaProximoControl) && fechaProximoControl < fecha;
            const isSaveDisabled = isImporteInvalid || !selectedPacienteId || isControlDateInvalid;

            return (
              <>
                <button
                  type="button"
                  disabled={isSaveDisabled}
                  onClick={() => handleSave(false)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all shadow-md active:scale-[0.98] ${
                    isSaveDisabled
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-[#0A2A6E] hover:bg-[#001648] text-white'
                  }`}
                >
                  Guardar atención
                </button>

                <button
                  type="button"
                  disabled={isSaveDisabled}
                  onClick={() => handleSave(true)}
                  className={`w-full py-2 rounded-xl font-semibold text-xs text-center transition-colors ${
                    isSaveDisabled
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-[#2E7DD1] hover:bg-blue-50'
                  }`}
                >
                  Guardar y enviar recordatorio por WhatsApp
                </button>
              </>
            );
          })()}
        </footer>

      </div>
    </div>
  );
};
