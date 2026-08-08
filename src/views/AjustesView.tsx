import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Tarifa } from '../types';

export const AjustesView: React.FC = () => {
  const {
    data,
    updateTarifa,
    addTarifa,
    deleteTarifa,
    restoreOfficialTarifas,
    exportJSON,
    importJSON,
    resetData,
    clearProductionData,
    formatSoles,
    generateTestData,
    clearTestData,
    hasTestData
  } = useClinic();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Tarifa>>({});

  const [showAddTarifa, setShowAddTarifa] = useState(false);
  const [newTarifaForm, setNewTarifaForm] = useState<Omit<Tarifa, 'id'>>({
    tratamiento: '',
    precioMin: 40,
    precioMax: 100,
    precioSugerido: 70,
    descripcion: '',
    porSesion: true
  });

  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [tarifaToDelete, setTarifaToDelete] = useState<Tarifa | null>(null);
  const [showRestoreTarifasModal, setShowRestoreTarifasModal] = useState(false);

  const handleStartEdit = (t: Tarifa) => {
    setEditingId(t.id);
    setEditForm({ ...t });
  };

  const handleSaveEdit = (id: string) => {
    if (editForm.tratamiento) {
      updateTarifa(id, editForm);
    }
    setEditingId(null);
  };

  const handleAddTarifaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarifaForm.tratamiento.trim()) return;

    addTarifa({
      ...newTarifaForm,
      tratamiento: newTarifaForm.tratamiento.trim(),
      precioMin: Number(newTarifaForm.precioMin),
      precioMax: Number(newTarifaForm.precioMax),
      precioSugerido: Number(newTarifaForm.precioSugerido)
    });

    setNewTarifaForm({
      tratamiento: '',
      precioMin: 40,
      precioMax: 100,
      precioSugerido: 70,
      descripcion: '',
      porSesion: true
    });
    setShowAddTarifa(false);
  };

  const handleConfirmDeleteTarifa = () => {
    if (tarifaToDelete) {
      deleteTarifa(tarifaToDelete.id);
      setTarifaToDelete(null);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importJSON(content);
          if (success) {
            alert('¡Datos importados correctamente!');
          } else {
            alert('Error al importar el archivo JSON. Verifica el formato.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28 animate-in fade-in duration-200">
      
      {/* Clinic Profile Card */}
      <section className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] text-center space-y-2 border border-slate-200">
        <div className="w-20 h-20 rounded-full bg-[#0A2A6E] text-white flex items-center justify-center mx-auto shadow-md font-bold text-2xl">
          <span className="material-symbols-outlined text-4xl">medical_services</span>
        </div>

        <h2 className="text-xl font-bold text-[#0A2A6E]">Podología Clínica Atoche</h2>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <span className="material-symbols-outlined text-sm text-[#2E7DD1]">location_on</span>
          <span>Ica, Perú</span>
          <span>•</span>
          <span className="material-symbols-outlined text-sm text-emerald-600">phone_iphone</span>
          <span>+51 956 965 762</span>
        </div>
      </section>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Management & Data buttons */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* GESTIÓN */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Gestión</h3>
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
              <div className="p-4 flex items-center justify-between font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#2E7DD1]">payments</span>
                  <span>Catálogo ({data.tarifas.length} tratamientos)</span>
                </div>
                <span className="material-symbols-outlined text-emerald-600 text-sm font-bold">check_circle</span>
              </div>

              <button
                onClick={() => setShowRestoreTarifasModal(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors font-bold text-[#0A2A6E] text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#2E7DD1]">sync</span>
                  <span>Cargar Tarifario Oficial (21 Tratamientos)</span>
                </div>
                <span className="material-symbols-outlined text-[#2E7DD1] text-sm">chevron_right</span>
              </button>

              <div className="p-4 flex items-center justify-between font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#2E7DD1]">schedule</span>
                  <span>Horario de Atención</span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">8am - 7pm</span>
              </div>
            </div>
          </div>

          {/* DATOS & BACKUP */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Datos y Respaldo</h3>
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
              <button
                onClick={exportJSON}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors font-bold text-slate-800 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#2E7DD1]">backup</span>
                  <span>Exportar Copia de Seguridad (JSON)</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">download</span>
              </button>

              <label className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors font-bold text-slate-800 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#2E7DD1]">upload_file</span>
                  <span>Importar Copia de Seguridad</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-slate-400 text-sm">upload</span>
              </label>

              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de restablecer los datos de ejemplo iniciales? Se perderán los cambios locales.')) {
                    resetData();
                  }
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 text-slate-700 font-bold transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-slate-500">restart_alt</span>
                  <span>Restablecer Todo a Ejemplo</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">refresh</span>
              </button>

              <button
                onClick={generateTestData}
                className="w-full p-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors font-bold text-amber-800 text-left border-t border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-600">labs</span>
                  <span>Generar datos de prueba</span>
                </div>
                <span className="material-symbols-outlined text-amber-600 text-sm">add_circle</span>
              </button>

              {hasTestData() && (
                <button
                  onClick={clearTestData}
                  className="w-full p-4 flex items-center justify-between hover:bg-orange-50/50 transition-colors font-bold text-orange-700 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-orange-600">cleaning_services</span>
                    <span>Eliminar datos de prueba</span>
                  </div>
                  <span className="material-symbols-outlined text-orange-600 text-sm">delete_sweep</span>
                </button>
              )}

              <button
                onClick={() => setShowClearConfirmModal(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-red-50 text-red-600 font-bold transition-colors text-left border-t border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-500">delete_forever</span>
                  <span>Iniciar en limpio (borrar todos los datos)</span>
                </div>
                <span className="material-symbols-outlined text-red-400 text-sm">chevron_right</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Tariffs Editor Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl p-5 shadow-[0px_4px_20px_rgba(10,42,110,0.04)] border border-slate-200 space-y-4">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#0A2A6E]">Catálogo de Tarifas y Tratamientos</h3>
                <p className="text-xs text-slate-500">{data.tarifas.length} tratamientos configurados con rangos de precio (S/).</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRestoreTarifasModal(true)}
                  className="bg-blue-50 text-[#0A2A6E] hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Restablecer tarifario desde lista oficial"
                >
                  <span className="material-symbols-outlined text-sm">sync</span>
                  Tarifario Oficial
                </button>

                <button
                  onClick={() => setShowAddTarifa(!showAddTarifa)}
                  className="bg-[#0A2A6E] text-white hover:bg-[#001648] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Nuevo
                </button>
              </div>
            </div>

            {/* Add Tarifa Form */}
            {showAddTarifa && (
              <form onSubmit={handleAddTarifaSubmit} className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 space-y-3 animate-in fade-in duration-150">
                <h4 className="text-xs font-bold text-[#0A2A6E]">Agregar Nuevo Tratamiento al Catálogo</h4>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Nombre del procedimiento o tratamiento"
                    value={newTarifaForm.tratamiento}
                    onChange={(e) => setNewTarifaForm({ ...newTarifaForm, tratamiento: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Precio Mín (S/)</label>
                      <input
                        type="number"
                        step="1"
                        required
                        value={newTarifaForm.precioMin}
                        onChange={(e) => setNewTarifaForm({ ...newTarifaForm, precioMin: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 mb-0.5">Sugerido (S/)</label>
                      <input
                        type="number"
                        step="1"
                        required
                        value={newTarifaForm.precioSugerido}
                        onChange={(e) => setNewTarifaForm({ ...newTarifaForm, precioSugerido: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border border-blue-300 rounded-lg text-xs bg-white focus:outline-none font-bold text-[#0A2A6E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Precio Máx (S/)</label>
                      <input
                        type="number"
                        step="1"
                        required
                        value={newTarifaForm.precioMax}
                        onChange={(e) => setNewTarifaForm({ ...newTarifaForm, precioMax: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Descripción clínica breve"
                    value={newTarifaForm.descripcion}
                    onChange={(e) => setNewTarifaForm({ ...newTarifaForm, descripcion: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddTarifa(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-600 bg-white border border-slate-200 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs text-white bg-[#0A2A6E] font-bold"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {/* Tariffs Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="grid grid-cols-12 bg-slate-50 p-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-6">Tratamiento podológico</div>
                <div className="col-span-4 text-right">Precio Sugerido (Rango)</div>
                <div className="col-span-2 text-center">Acciones</div>
              </div>

              {data.tarifas.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <p className="text-xs font-semibold text-slate-500">No hay tratamientos en el catálogo.</p>
                  <button
                    onClick={() => restoreOfficialTarifas()}
                    className="bg-[#0A2A6E] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs"
                  >
                    Cargar Catálogo Oficial (21 tratamientos)
                  </button>
                </div>
              ) : (
                data.tarifas.map(t => {
                  const isEditing = editingId === t.id;

                  return (
                    <div key={t.id} className="grid grid-cols-12 p-3 items-center text-xs hover:bg-slate-50 transition-colors">
                      <div className="col-span-6 space-y-0.5 pr-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.tratamiento || ''}
                            onChange={(e) => setEditForm({ ...editForm, tratamiento: e.target.value })}
                            className="w-full p-1.5 border border-blue-400 rounded text-xs font-bold text-slate-900"
                          />
                        ) : (
                          <div className="font-bold text-slate-800 leading-snug">
                            {t.tratamiento}
                          </div>
                        )}
                        
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="Descripción breve..."
                            value={editForm.descripcion || ''}
                            onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                            className="w-full p-1 border border-slate-200 rounded text-[11px] text-slate-600"
                          />
                        ) : (
                          t.descripcion && <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{t.descripcion}</p>
                        )}
                      </div>

                      <div className="col-span-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              title="Mínimo"
                              value={editForm.precioMin || 0}
                              onChange={(e) => setEditForm({ ...editForm, precioMin: parseFloat(e.target.value) || 0 })}
                              className="w-12 p-1 border border-slate-300 rounded text-right text-[11px]"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              type="number"
                              title="Sugerido"
                              value={editForm.precioSugerido || 0}
                              onChange={(e) => setEditForm({ ...editForm, precioSugerido: parseFloat(e.target.value) || 0 })}
                              className="w-14 p-1 border border-blue-500 font-bold text-[#0A2A6E] rounded text-right text-xs"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              type="number"
                              title="Máximo"
                              value={editForm.precioMax || 0}
                              onChange={(e) => setEditForm({ ...editForm, precioMax: parseFloat(e.target.value) || 0 })}
                              className="w-12 p-1 border border-slate-300 rounded text-right text-[11px]"
                            />
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[#0A2A6E] text-xs">
                              {formatSoles(t.precioSugerido)}
                            </span>
                            <p className="text-[10px] font-medium text-slate-400">
                              (Rango: S/ {t.precioMin} – {t.precioMax})
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 flex justify-center gap-1.5">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(t.id)}
                            className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-full font-bold transition-colors"
                            title="Guardar cambios"
                          >
                            <span className="material-symbols-outlined text-base">check</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(t)}
                            className="text-[#2E7DD1] hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                            title="Editar tratamiento"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        )}

                        <button
                          onClick={() => setTarifaToDelete(t)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                          title="Eliminar tratamiento"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Delete Single Tarifa Confirmation Modal */}
      {tarifaToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shrink-0">
              <span className="material-symbols-outlined text-2xl">delete</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Eliminar Tratamiento</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                ¿Deseas eliminar <strong className="text-slate-900">"{tarifaToDelete.tratamiento}"</strong> del catálogo de tarifas?
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTarifaToDelete(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTarifa}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Official Tarifas Confirmation Modal */}
      {showRestoreTarifasModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[#0A2A6E]">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">sync</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Cargar Catálogo Oficial</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Se reemplazará el catálogo actual con la lista oficial de <strong>21 tratamientos podológicos</strong> y sus rangos de precios (Consulta, Profilaxis, Podología profunda, Uñeros, Onicomicosis, Plantillas, etc.).
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRestoreTarifasModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  restoreOfficialTarifas();
                  setShowRestoreTarifasModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#0A2A6E] hover:bg-[#001648] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Cargar 21 Tratamientos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing Production Data */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Confirmar eliminación de datos</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Se eliminarán todos los pacientes y atenciones registradas. Esta acción no se puede deshacer. ¿Desea continuar?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearProductionData();
                  setShowClearConfirmModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
