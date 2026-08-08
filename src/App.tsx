import { useState } from 'react';
import { ClinicProvider } from './context/ClinicContext';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { InicioView } from './views/InicioView';
import { AgendaView } from './views/AgendaView';
import { PacientesView } from './views/PacientesView';
import { PacienteDetalleView } from './views/PacienteDetalleView';
import { IngresosView } from './views/IngresosView';
import { ControlesPendientesView } from './views/ControlesPendientesView';
import { AjustesView } from './views/AjustesView';
import { AtencionFormModal } from './components/AtencionFormModal';
import { PacienteFormModal } from './components/PacienteFormModal';
import { Paciente } from './types';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);

  // Modals
  const [isAtencionModalOpen, setIsAtencionModalOpen] = useState(false);
  const [atencionPacienteId, setAtencionPacienteId] = useState<string | undefined>(undefined);

  const [isPacienteModalOpen, setIsPacienteModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Paciente | null>(null);

  const handleOpenAtencionModal = (pacienteId?: string) => {
    setAtencionPacienteId(pacienteId);
    setIsAtencionModalOpen(true);
  };

  const handleOpenNewPacienteModal = () => {
    setPatientToEdit(null);
    setIsPacienteModalOpen(true);
  };

  const handleEditPaciente = (paciente: Paciente) => {
    setPatientToEdit(paciente);
    setIsPacienteModalOpen(true);
  };

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    // Clear individual patient detail if navigating to main tabs
    if (tab !== 'pacientes') {
      setSelectedPacienteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#191C1E] flex flex-col font-sans selection:bg-[#2E7DD1] selection:text-white">
      
      {/* Top Header Bar */}
      <Header onOpenControles={() => setCurrentTab('controles')} />

      {/* Main View Router */}
      <main className="flex-1">
        {selectedPacienteId ? (
          <PacienteDetalleView
            pacienteId={selectedPacienteId}
            onBack={() => setSelectedPacienteId(null)}
            onOpenAtencionModal={handleOpenAtencionModal}
            onEditPaciente={handleEditPaciente}
          />
        ) : (
          <>
            {currentTab === 'inicio' && (
              <InicioView
                onOpenAtencionModal={handleOpenAtencionModal}
                onOpenPacienteModal={handleOpenNewPacienteModal}
                onSelectPaciente={(id) => setSelectedPacienteId(id)}
                onOpenControlesView={() => setCurrentTab('controles')}
                onNavigateTab={(tab) => handleTabChange(tab)}
              />
            )}

            {currentTab === 'agenda' && (
              <AgendaView
                onOpenAtencionModal={handleOpenAtencionModal}
                onSelectPaciente={(id) => setSelectedPacienteId(id)}
              />
            )}

            {currentTab === 'pacientes' && (
              <PacientesView
                onSelectPaciente={(id) => setSelectedPacienteId(id)}
                onOpenNewPacienteModal={handleOpenNewPacienteModal}
              />
            )}

            {currentTab === 'ingresos' && (
              <IngresosView />
            )}

            {currentTab === 'controles' && (
              <ControlesPendientesView
                onBack={() => setCurrentTab('inicio')}
                onSelectPaciente={(id) => setSelectedPacienteId(id)}
              />
            )}

            {currentTab === 'ajustes' && (
              <AjustesView />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AtencionFormModal
        isOpen={isAtencionModalOpen}
        onClose={() => setIsAtencionModalOpen(false)}
        initialPacienteId={atencionPacienteId}
        onOpenNewPacienteModal={() => {
          setIsAtencionModalOpen(false);
          handleOpenNewPacienteModal();
        }}
      />

      <PacienteFormModal
        isOpen={isPacienteModalOpen}
        onClose={() => setIsPacienteModalOpen(false)}
        patientToEdit={patientToEdit}
        onPatientCreated={(newPatient) => {
          // Auto select if coming from registration
          handleOpenAtencionModal(newPatient.id);
        }}
      />

      {/* Fixed Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />

    </div>
  );
}

export default function App() {
  return (
    <ClinicProvider>
      <AppContent />
    </ClinicProvider>
  );
}
