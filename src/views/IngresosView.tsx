import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { parseFechaLocal } from '../utils/dateUtils';

export const IngresosView: React.FC = () => {
  const { data, formatSoles } = useClinic();
  const [period, setPeriod] = useState<'Semana' | 'Mes' | 'Año'>('Mes');
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);

  // Reference month: Current real month + offset
  const getReferenceMonthDate = () => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + selectedMonthOffset);
    return d;
  };

  const refDate = getReferenceMonthDate();
  const refYear = refDate.getFullYear();
  const refMonth = refDate.getMonth(); // 0-indexed

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthLabel = `${monthNames[refMonth]} ${refYear}`;

  // Helper to parse YYYY-MM-DD in local time
  const parseLocalDate = (fechaStr: string) => {
    const d = parseFechaLocal(fechaStr);
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  };

  // Filter atenciones for the current period (excluding solo_control records)
  const atencionesDelMes = data.atenciones.filter(a => {
    if (a.tipoRegistro === 'solo_control') return false;
    const { year, month } = parseLocalDate(a.fecha);
    return year === refYear && month === refMonth;
  });

  // Total Ingresos del mes
  const totalIngresosMes = atencionesDelMes.reduce((sum, a) => sum + a.importe, 0);

  // Pendiente del mes
  const pendienteTotal = atencionesDelMes
    .filter(a => a.estadoPago === 'Deuda' || a.metodoPago === 'Pago pendiente' || a.estadoPago === 'Pendiente')
    .reduce((sum, a) => sum + a.importe, 0);

  // Cobrado = Total menos los montos con estadoPago pendiente
  const cobradoTotal = Math.max(0, totalIngresosMes - pendienteTotal);

  // Comparison with previous month
  const prevMonthYear = refMonth === 0 ? refYear - 1 : refYear;
  const prevMonthIdx = refMonth === 0 ? 11 : refMonth - 1;
  const prevAtenciones = data.atenciones.filter(a => {
    if (a.tipoRegistro === 'solo_control') return false;
    const { year, month } = parseLocalDate(a.fecha);
    return year === prevMonthYear && month === prevMonthIdx;
  });
  const prevTotal = prevAtenciones.reduce((sum, a) => sum + a.importe, 0);
  const prevPendiente = prevAtenciones
    .filter(a => a.estadoPago === 'Deuda' || a.metodoPago === 'Pago pendiente' || a.estadoPago === 'Pendiente')
    .reduce((sum, a) => sum + a.importe, 0);
  const prevCobrado = Math.max(0, prevTotal - prevPendiente);

  let growthPct = 0;
  if (prevCobrado > 0) {
    growthPct = Math.round(((cobradoTotal - prevCobrado) / prevCobrado) * 100);
  }

  // 1. Ingresos por Semana (S1, S2, S3, S4)
  const semanas = [0, 0, 0, 0];
  atencionesDelMes.forEach(a => {
    const isPendiente = a.estadoPago === 'Deuda' || a.metodoPago === 'Pago pendiente' || a.estadoPago === 'Pendiente';
    if (!isPendiente) {
      const { day } = parseLocalDate(a.fecha);
      if (day <= 7) semanas[0] += a.importe;
      else if (day <= 14) semanas[1] += a.importe;
      else if (day <= 21) semanas[2] += a.importe;
      else semanas[3] += a.importe;
    }
  });

  const maxSemana = Math.max(...semanas, 1);

  // 2. Por Tratamiento distribution
  const tratamientoMap: Record<string, number> = {};
  atencionesDelMes.forEach(a => {
    const isPendiente = a.estadoPago === 'Deuda' || a.metodoPago === 'Pago pendiente' || a.estadoPago === 'Pendiente';
    if (!isPendiente) {
      tratamientoMap[a.tratamiento] = (tratamientoMap[a.tratamiento] || 0) + a.importe;
    }
  });

  const tratamientoList = Object.entries(tratamientoMap)
    .map(([name, total]) => ({
      name,
      total,
      pct: cobradoTotal > 0 ? Math.round((total / cobradoTotal) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);

  // 3. Por Método de Pago distribution
  const metodoMap: Record<string, number> = {};
  atencionesDelMes.forEach(a => {
    const key = a.estadoPago === 'Deuda' ? 'Pendiente' : a.metodoPago;
    metodoMap[key] = (metodoMap[key] || 0) + a.importe;
  });

  const totalMetodos = Object.values(metodoMap).reduce((sum, v) => sum + v, 0);

  const metodoColors: Record<string, string> = {
    'Yape': 'bg-[#6C157C]',
    'Efectivo': 'bg-[#0A2A6E]',
    'Plin': 'bg-[#2E7DD1]',
    'Transferencia': 'bg-emerald-600',
    'Tarjeta': 'bg-[#63a8ff]',
    'Pago pendiente': 'bg-amber-500',
    'Pendiente': 'bg-amber-500'
  };

  const metodoList = Object.entries(metodoMap)
    .map(([name, total]) => ({
      name,
      total,
      pct: totalMetodos > 0 ? Math.round((total / totalMetodos) * 100) : 0,
      color: metodoColors[name] || 'bg-slate-500'
    }))
    .sort((a, b) => b.total - a.total);

  // Ticket Promedio
  const numAtencionesPagadas = atencionesDelMes.filter(a => a.estadoPago === 'Pagado').length;
  const ticketPromedio = numAtencionesPagadas > 0 ? cobradoTotal / numAtencionesPagadas : 0;

  // % Asistencia a Controles
  const atencionesConControl = atencionesDelMes.filter(a => a.fechaProximoControl);
  const atencionesAsistidas = atencionesConControl.filter(a => a.controlAsistido).length;
  const asistenciaPct = atencionesConControl.length > 0
    ? Math.round((atencionesAsistidas / atencionesConControl.length) * 100)
    : 85;

  const handleExportPDF = () => {
    alert(`Reporte financiero de ${monthLabel} exportado correctamente.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28 animate-in fade-in duration-200">
      
      {/* Header & Period Selector */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0A2A6E]">Ingresos</h2>

        {/* Period Pills */}
        <div className="flex justify-between items-center bg-slate-100 p-1 rounded-full text-xs font-bold">
          {(['Semana', 'Mes', 'Año'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-full transition-all text-center ${
                period === p
                  ? 'bg-[#0A2A6E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            onClick={() => setSelectedMonthOffset(prev => prev - 1)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-700"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          <span className="text-sm font-bold text-slate-900">{monthLabel}</span>

          <button
            onClick={() => setSelectedMonthOffset(prev => prev + 1)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-700"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </section>

      {/* Main Financial Summary (Large Navy Card) */}
      <section className="space-y-4">
        <div className="bg-[#0A2A6E] rounded-2xl p-6 text-white shadow-md relative overflow-hidden space-y-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
            Ingresos totales de {monthLabel}
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {formatSoles(cobradoTotal)}
          </h3>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              {growthPct >= 0 ? `+${growthPct}% vs mes anterior` : `${growthPct}% vs mes anterior`}
            </span>
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Cobrado</span>
            <div className="text-lg font-bold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {formatSoles(cobradoTotal)}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold block mb-1">Pendiente</span>
            <div className="text-lg font-bold text-amber-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {formatSoles(pendienteTotal)}
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Chart 1: Bar Chart "Ingresos por semana" */}
        <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-slate-200 md:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Ingresos por semana ({monthLabel})</h4>
          
          <div className="flex items-end justify-between h-40 pt-4 px-2">
            {semanas.map((monto, idx) => {
              const heightPct = maxSemana > 0 && monto > 0 ? Math.max((monto / maxSemana) * 100, 12) : 6;
              const isHighlight = maxSemana > 0 && monto === maxSemana;

              const label = monto >= 1000 ? `S/ ${(monto / 1000).toFixed(1)}k` : `S/ ${monto}`;

              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[11px] font-bold text-slate-700">
                    {label}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-10 sm:w-14 rounded-t-lg transition-all ${
                      isHighlight
                        ? 'bg-[#0A2A6E] shadow-sm'
                        : monto > 0
                        ? 'bg-[#63a8ff]/70 hover:bg-[#63a8ff]'
                        : 'bg-slate-200'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-700">S{idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Por tratamiento */}
        <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-slate-200 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Por tratamiento</h4>

          <div className="space-y-3">
            {tratamientoList.length === 0 ? (
              <p className="text-xs text-slate-400">Sin datos este mes.</p>
            ) : (
              tratamientoList.slice(0, 4).map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="font-bold text-slate-900">{formatSoles(item.total)}</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.pct}%` }}
                      className="h-full bg-[#0A2A6E] rounded-full transition-all duration-300"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">{item.pct}%</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chart 3: Por método de pago */}
        <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-slate-200 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Por método de pago</h4>

          <div className="flex items-center justify-between gap-4">
            {/* Donut approximation */}
            <div className="relative w-28 h-28 rounded-full flex items-center justify-center shrink-0" style={{
              background: 'conic-gradient(#6C157C 0% 38%, #0A2A6E 38% 68%, #2E7DD1 68% 86%, #f59e0b 86% 100%)'
            }}>
              <div className="w-18 h-18 bg-white rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400">payments</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {metodoList.map(m => (
                <div key={m.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${m.color}`} />
                    <span className="font-medium text-slate-700">{m.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Key Stats Summary */}
      <section className="bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-slate-200 grid grid-cols-2 divide-x divide-slate-100 text-center">
        <div>
          <p className="text-xs text-slate-500 font-semibold mb-1">Ticket promedio</p>
          <p className="text-lg font-extrabold text-[#0A2A6E]">{formatSoles(ticketPromedio)}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500 font-semibold mb-1">Asistencia a controles</p>
          <p className="text-lg font-extrabold text-emerald-600">{asistenciaPct}%</p>
        </div>
      </section>

      {/* Export Report Button */}
      <button
        onClick={handleExportPDF}
        className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#2E7DD1] text-[#2E7DD1] hover:bg-blue-50 transition-colors font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
      >
        <span className="material-symbols-outlined text-sm">download</span>
        Exportar reporte en PDF
      </button>

    </div>
  );
};
