import { ClinicData, Tarifa } from '../types';
import { getTodayISO, parseFechaLocal, formatISO } from '../utils/dateUtils';

export const TARIFAS_INICIALES: Tarifa[] = [
  {
    id: 't1',
    tratamiento: 'Consulta podológica',
    precioMin: 20,
    precioMax: 60,
    precioSugerido: 40,
    descripcion: 'Evaluación inicial y diagnóstico',
    porSesion: false
  },
  {
    id: 't2',
    tratamiento: 'Profilaxis podológica (limpieza básica)',
    precioMin: 40,
    precioMax: 70,
    precioSugerido: 55,
    descripcion: 'Corte de uñas, limpieza de cutículas, eliminación de callosidades leves',
    porSesion: false
  },
  {
    id: 't3',
    tratamiento: 'Podología profunda',
    precioMin: 80,
    precioMax: 120,
    precioSugerido: 100,
    descripcion: 'Limpieza integral para pies con hiperqueratosis, hongos o pacientes diabéticos',
    porSesion: false
  },
  {
    id: 't4',
    tratamiento: 'Limpieza de uñas',
    precioMin: 30,
    precioMax: 45,
    precioSugerido: 38,
    descripcion: 'Limpieza profesional de las uñas',
    porSesion: false
  },
  {
    id: 't5',
    tratamiento: 'Limpieza de piel plantar',
    precioMin: 30,
    precioMax: 45,
    precioSugerido: 38,
    descripcion: 'Eliminación de durezas y piel muerta',
    porSesion: false
  },
  {
    id: 't6',
    tratamiento: 'Tratamiento integral del pie',
    precioMin: 45,
    precioMax: 90,
    precioSugerido: 65,
    descripcion: 'Corte de uñas, eliminación de callos, exfoliación e hidratación',
    porSesion: false
  },
  {
    id: 't7',
    tratamiento: 'Extracción de uña encarnada (uñero)',
    precioMin: 50,
    precioMax: 120,
    precioSugerido: 85,
    descripcion: 'Retiro parcial de la uña encarnada',
    porSesion: false
  },
  {
    id: 't8',
    tratamiento: 'Tratamiento de onicocriptosis',
    precioMin: 40,
    precioMax: 100,
    precioSugerido: 70,
    descripcion: 'Corrección y seguimiento del uñero',
    porSesion: false
  },
  {
    id: 't9',
    tratamiento: 'Fenolización de uña',
    precioMin: 50,
    precioMax: 150,
    precioSugerido: 100,
    descripcion: 'Procedimiento para evitar que el uñero reaparezca',
    porSesion: false
  },
  {
    id: 't10',
    tratamiento: 'Reconstrucción de uñas (acrílico medicinal)',
    precioMin: 25,
    precioMax: 80,
    precioSugerido: 50,
    descripcion: 'Reconstrucción estética y funcional de uñas dañadas',
    porSesion: false
  },
  {
    id: 't11',
    tratamiento: 'Tratamiento de onicomicosis (hongos)',
    precioMin: 80,
    precioMax: 200,
    precioSugerido: 140,
    descripcion: 'Incluye limpieza y medicamentos tópicos',
    porSesion: true
  },
  {
    id: 't12',
    tratamiento: 'Láser para onicomicosis',
    precioMin: 70,
    precioMax: 200,
    precioSugerido: 135,
    descripcion: 'Tratamiento con láser para hongos en uñas',
    porSesion: true
  },
  {
    id: 't13',
    tratamiento: 'Ortesis de silicona',
    precioMin: 20,
    precioMax: 80,
    precioSugerido: 50,
    descripcion: 'Correctores personalizados para dedos',
    porSesion: false
  },
  {
    id: 't14',
    tratamiento: 'Brackets podológicos',
    precioMin: 80,
    precioMax: 180,
    precioSugerido: 130,
    descripcion: 'Corrección de uñas curvas o deformadas',
    porSesion: false
  },
  {
    id: 't15',
    tratamiento: 'Fibra molecular',
    precioMin: 30,
    precioMax: 70,
    precioSugerido: 50,
    descripcion: 'Reparación y fortalecimiento de uñas',
    porSesion: false
  },
  {
    id: 't16',
    tratamiento: 'Reflexología podal',
    precioMin: 40,
    precioMax: 80,
    precioSugerido: 60,
    descripcion: 'Terapia de masaje por puntos reflejos',
    porSesion: false
  },
  {
    id: 't17',
    tratamiento: 'Pedigrafía / Huella plantar',
    precioMin: 20,
    precioMax: 40,
    precioSugerido: 30,
    descripcion: 'Estudio de la pisada',
    porSesion: false
  },
  {
    id: 't18',
    tratamiento: 'Plantillas ortopédicas personalizadas',
    precioMin: 150,
    precioMax: 600,
    precioSugerido: 350,
    descripcion: 'Elaboradas según estudio biomecánico',
    porSesion: false
  },
  {
    id: 't19',
    tratamiento: 'Exfoliación podal',
    precioMin: 20,
    precioMax: 50,
    precioSugerido: 35,
    descripcion: 'Eliminación de células muertas',
    porSesion: false
  },
  {
    id: 't20',
    tratamiento: 'Hidratación profunda con parafina',
    precioMin: 30,
    precioMax: 60,
    precioSugerido: 45,
    descripcion: 'Tratamiento para resequedad',
    porSesion: false
  },
  {
    id: 't21',
    tratamiento: 'Curación y control postoperatorio',
    precioMin: 20,
    precioMax: 50,
    precioSugerido: 35,
    descripcion: 'Seguimiento tras procedimientos',
    porSesion: true
  }
];

// Helper to generate dynamic date string relative to today
const offsetDays = (days: number): string => {
  const d = parseFechaLocal(getTodayISO());
  d.setDate(d.getDate() + days);
  return formatISO(d);
};

const todayStr = getTodayISO();

export const DATA_INICIAL: ClinicData = {
  tarifas: TARIFAS_INICIALES,
  pacientes: [
    {
      id: 'p1',
      nombres: 'Lucía',
      apellidos: 'Castro Mendoza',
      dni: '45892103',
      telefono: '956123456',
      edad: 38,
      fechaRegistro: offsetDays(-180),
      notas: 'Paciente sensible en zona del hallux derecho.'
    },
    {
      id: 'p2',
      nombres: 'Roberto',
      apellidos: 'Morales Silva',
      dni: '10293847',
      telefono: '987654321',
      edad: 52,
      fechaRegistro: offsetDays(-150),
      notas: 'Uso frecuente de calzado deportivo.'
    },
    {
      id: 'p3',
      nombres: 'Carlos',
      apellidos: 'Mendoza Ruiz',
      dni: '21983475',
      telefono: '954321876',
      edad: 45,
      fechaRegistro: offsetDays(-120),
      notas: 'Tratamiento continuo por onicocriptosis recurrente.'
    },
    {
      id: 'p4',
      nombres: 'Ana Lucía',
      apellidos: 'Rojas Peña',
      dni: '70891234',
      telefono: '951234876',
      edad: 29,
      fechaRegistro: offsetDays(-90),
      notas: 'Alergia a la yodopovidona.'
    },
    {
      id: 'p5',
      nombres: 'María Elena',
      apellidos: 'Quispe Roldán',
      dni: '08912345',
      telefono: '956965762',
      edad: 54,
      fechaRegistro: offsetDays(-200),
      notas: 'Paciente diabética, requiere curación cuidadosa.'
    },
    {
      id: 'p6',
      nombres: 'Sofía',
      apellidos: 'Vargas Alvites',
      dni: '48239102',
      telefono: '981273645',
      edad: 41,
      fechaRegistro: offsetDays(-60),
      notas: 'Realiza running los fines de semana.'
    },
    {
      id: 'p7',
      nombres: 'Carlos',
      apellidos: 'Ruiz Flores',
      dni: '10928374',
      telefono: '976543210',
      edad: 63,
      fechaRegistro: offsetDays(-45),
      notas: 'Suela ortopédica recomendada.'
    },
    {
      id: 'p8',
      nombres: 'Rosa',
      apellidos: 'Hinostroza Peña',
      dni: '29384756',
      telefono: '965432187',
      edad: 49,
      fechaRegistro: offsetDays(-30),
      notas: 'Tratamiento con láser para onicomicosis.'
    }
  ],
  atenciones: [
    // Hoy
    {
      id: 'a1',
      pacienteId: 'p1',
      fecha: todayStr,
      hora: '09:00',
      tratamiento: 'Profilaxis podológica (limpieza básica)',
      importe: 55.00,
      metodoPago: 'Efectivo',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(14),
      controlAsistido: false,
      observaciones: 'Limpieza completa de surcos y pulido plantar.',
      estadoCita: 'Confirmada'
    },
    {
      id: 'a2',
      pacienteId: 'p2',
      fecha: todayStr,
      hora: '09:45',
      tratamiento: 'Extracción de uña encarnada (uñero)',
      importe: 85.00,
      metodoPago: 'Yape',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(7),
      controlAsistido: false,
      observaciones: 'Resección de espícula en el hallux izquierdo.',
      estadoCita: 'Pendiente'
    },
    {
      id: 'a3',
      pacienteId: 'p3',
      fecha: todayStr,
      hora: '10:30',
      tratamiento: 'Podología profunda',
      importe: 100.00,
      metodoPago: 'Efectivo',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(30),
      controlAsistido: false,
      observaciones: 'Atención integral, deslaminación de hiperqueratosis.',
      estadoCita: 'Confirmada'
    },
    {
      id: 'a4',
      pacienteId: 'p4',
      fecha: todayStr,
      hora: '11:15',
      tratamiento: 'Profilaxis podológica (limpieza básica)',
      importe: 55.00,
      metodoPago: 'Plin',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(21),
      controlAsistido: false,
      observaciones: 'Corte correcto de uñas y humectación profunda.',
      estadoCita: 'Confirmada'
    },
    {
      id: 'a5',
      pacienteId: 'p2',
      fecha: todayStr,
      hora: '12:00',
      tratamiento: 'Curación y control postoperatorio',
      importe: 35.00,
      metodoPago: 'Pago pendiente',
      estadoPago: 'Deuda',
      fechaProximoControl: offsetDays(12),
      controlAsistido: false,
      observaciones: 'Curación post-quirúrgica y cambio de mecha.',
      estadoCita: 'Pendiente'
    },
    {
      id: 'a6',
      pacienteId: 'p6',
      fecha: todayStr,
      hora: '14:30',
      tratamiento: 'Pedigrafía / Huella plantar',
      importe: 30.00,
      metodoPago: 'Pago pendiente',
      estadoPago: 'Deuda',
      fechaProximoControl: offsetDays(17),
      controlAsistido: false,
      observaciones: 'Análisis de pisada y recomendación de plantilla.',
      estadoCita: 'Confirmada'
    },

    // Controles atrasados (Overdue controls)
    {
      id: 'a7',
      pacienteId: 'p7',
      fecha: offsetDays(-18),
      hora: '10:00',
      tratamiento: 'Limpieza de piel plantar',
      importe: 38.00,
      metodoPago: 'Efectivo',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(-2),
      controlAsistido: false,
      observaciones: 'Desbridamiento de heloma interdigital. Requiere revisión.',
      estadoCita: 'Completada'
    },
    {
      id: 'a8',
      pacienteId: 'p5',
      fecha: offsetDays(-16),
      hora: '11:00',
      tratamiento: 'Podología profunda',
      importe: 100.00,
      metodoPago: 'Yape',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(-1),
      controlAsistido: false,
      observaciones: 'Paciente diabética. Control de cicatrización.',
      estadoCita: 'Completada'
    },
    {
      id: 'a9',
      pacienteId: 'p8',
      fecha: offsetDays(-24),
      hora: '16:00',
      tratamiento: 'Láser para onicomicosis',
      importe: 135.00,
      metodoPago: 'Transferencia',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(-8),
      controlAsistido: false,
      observaciones: 'Sesión 2 de láser. Verificar mejoría lámina ungueal.',
      estadoCita: 'Completada'
    },

    // Atenciones recientes
    {
      id: 'a10',
      pacienteId: 'p1',
      fecha: offsetDays(-6),
      hora: '10:00',
      tratamiento: 'Tratamiento integral del pie',
      importe: 65.00,
      metodoPago: 'Yape',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(8),
      controlAsistido: true,
      observaciones: 'Sesión regular.',
      estadoCita: 'Completada'
    },
    {
      id: 'a11',
      pacienteId: 'p3',
      fecha: offsetDays(-5),
      hora: '11:30',
      tratamiento: 'Brackets podológicos',
      importe: 130.00,
      metodoPago: 'Tarjeta',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(9),
      controlAsistido: false,
      observaciones: 'Colocación de braceta podológica.',
      estadoCita: 'Completada'
    },
    {
      id: 'a12',
      pacienteId: 'p4',
      fecha: offsetDays(-4),
      hora: '15:00',
      tratamiento: 'Fenolización de uña',
      importe: 100.00,
      metodoPago: 'Yape',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(10),
      controlAsistido: false,
      observaciones: 'Tratamiento profiláctico.',
      estadoCita: 'Completada'
    },
    {
      id: 'a13',
      pacienteId: 'p6',
      fecha: offsetDays(-3),
      hora: '09:30',
      tratamiento: 'Profilaxis podológica (limpieza básica)',
      importe: 55.00,
      metodoPago: 'Efectivo',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(11),
      controlAsistido: false,
      observaciones: 'Mantenimiento preventivo.',
      estadoCita: 'Completada'
    },
    {
      id: 'a14',
      pacienteId: 'p8',
      fecha: offsetDays(-2),
      hora: '16:30',
      tratamiento: 'Tratamiento de onicomicosis (hongos)',
      importe: 140.00,
      metodoPago: 'Plin',
      estadoPago: 'Pagado',
      fechaProximoControl: offsetDays(12),
      controlAsistido: false,
      observaciones: 'Limpieza con fresado ungueal.',
      estadoCita: 'Completada'
    }
  ]
};
