import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Paciente } from '../types';

interface PacienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Paciente | null;
  onPatientCreated?: (newPatient: Paciente) => void;
}

export const PacienteFormModal: React.FC<PacienteFormModalProps> = ({
  isOpen,
  onClose,
  patientToEdit,
  onPatientCreated
}) => {
  const { addPaciente, updatePaciente } = useClinic();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [edad, setEdad] = useState<number>(35);
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (patientToEdit) {
      setNombres(patientToEdit.nombres);
      setApellidos(patientToEdit.apellidos);
      setDni(patientToEdit.dni);
      setTelefono(patientToEdit.telefono);
      setEdad(patientToEdit.edad);
      setNotas(patientToEdit.notas || '');
    } else {
      setNombres('');
      setApellidos('');
      setDni('');
      setTelefono('');
      setEdad(35);
      setNotas('');
    }
  }, [patientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres.trim() || !apellidos.trim() || !telefono.trim()) {
      alert('Por favor completa los campos obligatorios (Nombres, Apellidos y Teléfono).');
      return;
    }

    if (patientToEdit) {
      updatePaciente({
        ...patientToEdit,
        nombres,
        apellidos,
        dni,
        telefono,
        edad: Number(edad),
        notas
      });
    } else {
      const created = addPaciente({
        nombres,
        apellidos,
        dni,
        telefono,
        edad: Number(edad),
        notas
      });
      if (onPatientCreated) {
        onPatientCreated(created);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <header className="bg-[#0A2A6E] text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-base">
            {patientToEdit ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
              <input
                type="text"
                required
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej. María Elena"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
              <input
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Quispe Roldán"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">DNI</label>
              <input
                type="text"
                maxLength={8}
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="8 dígitos"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Edad</label>
              <input
                type="number"
                value={edad}
                onChange={(e) => setEdad(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono WhatsApp *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">+51</span>
              <input
                type="tel"
                required
                maxLength={9}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="956965762"
                className="w-full pl-11 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notas Médicas / Alergias</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Paciente diabética, alergia a Yodo."
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2E7DD1]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0A2A6E] text-white text-xs font-bold hover:bg-[#001648] shadow-sm"
            >
              {patientToEdit ? 'Guardar Cambios' : 'Registrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
