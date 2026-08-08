export type MetodoPago = 'Efectivo' | 'Yape' | 'Plin' | 'Transferencia' | 'Tarjeta' | 'Pago pendiente';

export type EstadoPago = 'Pagado' | 'Pendiente' | 'Deuda';

export type EstadoCita = 'Confirmada' | 'Pendiente' | 'Control' | 'Completada' | 'Cancelada';

export interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  edad: number;
  fechaRegistro: string; // YYYY-MM-DD
  notas?: string;
  foto?: string;
}

export interface Atencion {
  id: string;
  pacienteId: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM e.g. "10:30"
  tratamiento: string;
  importe: number;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  fechaProximoControl?: string; // YYYY-MM-DD
  controlAsistido?: boolean;
  observaciones?: string;
  fotoPie?: string;
  estadoCita?: EstadoCita;
  tipoRegistro?: 'atencion' | 'solo_control';
  recordatoriosEnviados?: number;
}

export interface Tarifa {
  id: string;
  tratamiento: string;
  precioMin: number;
  precioMax: number;
  precioSugerido: number;
  descripcion?: string;
  porSesion?: boolean;
}

export interface ClinicData {
  pacientes: Paciente[];
  atenciones: Atencion[];
  tarifas: Tarifa[];
}
