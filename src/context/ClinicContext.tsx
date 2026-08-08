import React, { createContext, useContext, useState, useEffect } from 'react';
import { Paciente, Atencion, Tarifa, ClinicData } from '../types';
import { DATA_INICIAL, TARIFAS_INICIALES } from '../data/initialData';
import { getTodayISO, parseFechaLocal, formatFechaPeruana } from '../utils/dateUtils';

const LOCAL_STORAGE_KEY = 'podologia_atoche_data_v1';

interface ClinicContextType {
  data: ClinicData;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  addPaciente: (paciente: Omit<Paciente, 'id' | 'fechaRegistro'>) => Paciente;
  updatePaciente: (paciente: Paciente) => void;
  deletePaciente: (id: string) => void;
  addAtencion: (atencion: Omit<Atencion, 'id'>) => Atencion;
  updateAtencion: (atencion: Atencion) => void;
  deleteAtencion: (id: string) => void;
  updateTarifa: (id: string, updated: Partial<Tarifa>) => void;
  addTarifa: (tarifa: Omit<Tarifa, 'id'>) => void;
  deleteTarifa: (id: string) => void;
  restoreOfficialTarifas: () => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => boolean;
  resetData: () => void;
  clearProductionData: () => void;
  formatSoles: (amount: number) => string;
  formatFechaPeruana: (dateString?: string) => string;
  getOverdueControls: () => Array<{ atencion: Atencion; paciente: Paciente; diasRetraso: number }>;
  markControlAsistido: (atencionId: string, asistido: boolean) => void;
  incrementRecordatorioEnviado: (atencionId: string) => void;
  generateTestData: () => void;
  clearTestData: () => void;
  hasTestData: () => boolean;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize with real current local date of the device
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());

  const [data, setData] = useState<ClinicData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pacientes && parsed.atenciones && parsed.tarifas) {
          // Auto-migrate tariffs to new range structure with id
          const SESION_TRATAMIENTOS = [
            'tratamiento de onicomicosis (hongos)',
            'láser para onicomicosis',
            'curación y control postoperatorio'
          ];
          parsed.tarifas = parsed.tarifas.map((t: any, idx: number) => {
            const isSesionSpec = SESION_TRATAMIENTOS.includes((t.tratamiento || '').toLowerCase().trim());
            return {
              id: t.id || `t_${idx + 1}_${Date.now()}`,
              tratamiento: t.tratamiento || 'Tratamiento',
              precioMin: t.precioMin ?? (t.precio || 50),
              precioMax: t.precioMax ?? (t.precio || 150),
              precioSugerido: t.precioSugerido ?? (t.precio || 80),
              descripcion: t.descripcion || '',
              porSesion: typeof t.porSesion === 'boolean' ? t.porSesion : isSesionSpec
            };
          });
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    return DATA_INICIAL;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }, [data]);

  const addPaciente = (newP: Omit<Paciente, 'id' | 'fechaRegistro'>): Paciente => {
    const today = getTodayISO();
    const paciente: Paciente = {
      ...newP,
      id: 'p_' + Date.now(),
      fechaRegistro: today
    };
    setData(prev => ({
      ...prev,
      pacientes: [paciente, ...prev.pacientes]
    }));
    return paciente;
  };

  const updatePaciente = (updated: Paciente) => {
    setData(prev => ({
      ...prev,
      pacientes: prev.pacientes.map(p => p.id === updated.id ? updated : p)
    }));
  };

  const deletePaciente = (id: string) => {
    setData(prev => ({
      ...prev,
      pacientes: prev.pacientes.filter(p => p.id !== id),
      atenciones: prev.atenciones.filter(a => a.pacienteId !== id)
    }));
  };

  const addAtencion = (newA: Omit<Atencion, 'id'>): Atencion => {
    const atencion: Atencion = {
      ...newA,
      id: 'a_' + Date.now()
    };
    setData(prev => ({
      ...prev,
      atenciones: [atencion, ...prev.atenciones]
    }));
    return atencion;
  };

  const updateAtencion = (updated: Atencion) => {
    setData(prev => ({
      ...prev,
      atenciones: prev.atenciones.map(a => a.id === updated.id ? updated : a)
    }));
  };

  const deleteAtencion = (id: string) => {
    setData(prev => ({
      ...prev,
      atenciones: prev.atenciones.filter(a => a.id !== id)
    }));
  };

  const updateTarifa = (id: string, updatedFields: Partial<Tarifa>) => {
    setData(prev => ({
      ...prev,
      tarifas: prev.tarifas.map(t => t.id === id ? { ...t, ...updatedFields } : t)
    }));
  };

  const addTarifa = (newTarifa: Omit<Tarifa, 'id'>) => {
    setData(prev => {
      const tarifa: Tarifa = {
        ...newTarifa,
        id: 't_' + Date.now()
      };
      return {
        ...prev,
        tarifas: [...prev.tarifas, tarifa]
      };
    });
  };

  const deleteTarifa = (id: string) => {
    setData(prev => ({
      ...prev,
      tarifas: prev.tarifas.filter(t => t.id !== id && t.tratamiento !== id)
    }));
  };

  const restoreOfficialTarifas = () => {
    setData(prev => ({
      ...prev,
      tarifas: TARIFAS_INICIALES
    }));
  };

  const exportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `podologia_atoche_backup_${getTodayISO()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.pacientes) && Array.isArray(parsed.atenciones) && Array.isArray(parsed.tarifas)) {
        setData(parsed);
        return true;
      }
    } catch (e) {
      console.error('Import error', e);
    }
    return false;
  };

  const resetData = () => {
    setData(DATA_INICIAL);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const clearProductionData = () => {
    setData(prev => ({
      ...prev,
      pacientes: [],
      atenciones: []
    }));
  };

  const formatSoles = (amount: number): string => {
    return `S/ ${(amount || 0).toFixed(2)}`;
  };

  const getOverdueControls = () => {
    // Current date reference: real local today
    const now = parseFechaLocal(getTodayISO());
    const overdueList: Array<{ atencion: Atencion; paciente: Paciente; diasRetraso: number }> = [];

    data.atenciones.forEach(atencion => {
      if (atencion.fechaProximoControl && !atencion.controlAsistido) {
        const controlDate = parseFechaLocal(atencion.fechaProximoControl);
        if (controlDate < now) {
          const paciente = data.pacientes.find(p => p.id === atencion.pacienteId);
          if (paciente) {
            const diffTime = Math.abs(now.getTime() - controlDate.getTime());
            const diasRetraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            overdueList.push({ atencion, paciente, diasRetraso });
          }
        }
      }
    });

    return overdueList.sort((a, b) => b.diasRetraso - a.diasRetraso);
  };

  const markControlAsistido = (atencionId: string, asistido: boolean) => {
    setData(prev => ({
      ...prev,
      atenciones: prev.atenciones.map(a => a.id === atencionId ? { ...a, controlAsistido: asistido } : a)
    }));
  };

  const incrementRecordatorioEnviado = (atencionId: string) => {
    setData(prev => ({
      ...prev,
      atenciones: prev.atenciones.map(a =>
        a.id === atencionId
          ? { ...a, recordatoriosEnviados: (a.recordatoriosEnviados || 0) + 1 }
          : a
      )
    }));
  };

  const generateTestData = () => {
    const today = getTodayISO();
    const p1Id = 'p_test_19_' + Date.now();
    const p2Id = 'p_test_3_' + Date.now();
    const p3Id = 'p_test_fut_' + Date.now();

    const parseToIso = (offsetDays: number) => {
      const d = parseFechaLocal(today);
      d.setDate(d.getDate() + offsetDays);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const testPatients: Paciente[] = [
      {
        id: p1Id,
        nombres: '[PRUEBA] Carlos',
        apellidos: 'Mendoza Vencido',
        dni: '99881122',
        telefono: '956965762',
        edad: 45,
        fechaRegistro: parseToIso(-30),
        notas: 'Paciente de prueba con control vencido hace 19 días.'
      },
      {
        id: p2Id,
        nombres: '[PRUEBA] María',
        apellidos: 'García Reciente',
        dni: '88772233',
        telefono: '956965762',
        edad: 38,
        fechaRegistro: parseToIso(-15),
        notas: 'Paciente de prueba con control vencido hace 3 días.'
      },
      {
        id: p3Id,
        nombres: '[PRUEBA] Ana',
        apellidos: 'Torres Futuro',
        dni: '77663344',
        telefono: '956965762',
        edad: 29,
        fechaRegistro: parseToIso(-5),
        notas: 'Paciente de prueba con control programado a futuro.'
      }
    ];

    const testAtenciones: Atencion[] = [
      {
        id: 'a_test_19_' + Date.now(),
        pacienteId: p1Id,
        fecha: parseToIso(-30),
        hora: '09:00',
        tratamiento: 'Podología profunda',
        importe: 100,
        metodoPago: 'Efectivo',
        estadoPago: 'Pagado',
        fechaProximoControl: parseToIso(-19), // 19 days ago
        controlAsistido: false,
        observaciones: 'Atención de prueba - Control vencido hace 19 días',
        estadoCita: 'Completada',
        tipoRegistro: 'atencion',
        recordatoriosEnviados: 0
      },
      {
        id: 'a_test_3_' + Date.now(),
        pacienteId: p2Id,
        fecha: parseToIso(-15),
        hora: '11:00',
        tratamiento: 'Tratamiento de onicomicosis (hongos)',
        importe: 140,
        metodoPago: 'Yape',
        estadoPago: 'Pagado',
        fechaProximoControl: parseToIso(-3), // 3 days ago
        controlAsistido: false,
        observaciones: 'Atención de prueba - Control vencido hace 3 días',
        estadoCita: 'Completada',
        tipoRegistro: 'atencion',
        recordatoriosEnviados: 0
      },
      {
        id: 'a_test_fut_' + Date.now(),
        pacienteId: p3Id,
        fecha: parseToIso(-5),
        hora: '16:00',
        tratamiento: 'Profilaxis podológica (limpieza básica)',
        importe: 55,
        metodoPago: 'Plin',
        estadoPago: 'Pagado',
        fechaProximoControl: parseToIso(10), // 10 days in future
        controlAsistido: false,
        observaciones: 'Atención de prueba - Control programado a futuro',
        estadoCita: 'Confirmada',
        tipoRegistro: 'atencion',
        recordatoriosEnviados: 0
      }
    ];

    setData(prev => ({
      ...prev,
      pacientes: [...testPatients, ...prev.pacientes],
      atenciones: [...testAtenciones, ...prev.atenciones]
    }));
  };

  const clearTestData = () => {
    setData(prev => {
      const testPatientIds = prev.pacientes
        .filter(p => p.nombres.includes('[PRUEBA]'))
        .map(p => p.id);

      return {
        ...prev,
        pacientes: prev.pacientes.filter(p => !p.nombres.includes('[PRUEBA]')),
        atenciones: prev.atenciones.filter(
          a => !testPatientIds.includes(a.pacienteId) && !a.id.includes('_test_')
        )
      };
    });
  };

  const hasTestData = (): boolean => {
    return data.pacientes.some(p => p.nombres.includes('[PRUEBA]'));
  };

  return (
    <ClinicContext.Provider
      value={{
        data,
        selectedDate,
        setSelectedDate,
        addPaciente,
        updatePaciente,
        deletePaciente,
        addAtencion,
        updateAtencion,
        deleteAtencion,
        updateTarifa,
        addTarifa,
        deleteTarifa,
        restoreOfficialTarifas,
        exportJSON,
        importJSON,
        resetData,
        clearProductionData,
        formatSoles,
        formatFechaPeruana,
        getOverdueControls,
        markControlAsistido,
        incrementRecordatorioEnviado,
        generateTestData,
        clearTestData,
        hasTestData
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
