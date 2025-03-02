
import { useState, useEffect } from "react";
import { AddMeterDialog } from "@/components/AddMeterDialog";
import { FilterSection } from "@/components/FilterSection";
import { HeaderSection } from "@/components/HeaderSection";
import { MeterList } from "@/components/MeterList";
import { useMeterData } from "@/hooks/useMeterData";
import { createMeterActions } from "@/actions/meterActions";

/**
 * Hauptkomponente für die Zählerverwaltung
 * Diese Komponente orchestriert die gesamte Anwendung und verwaltet den Zustand
 */
const Index = () => {
  // Zustandsvariablen für Lade- und Fehlerzustände
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hole Zustand und Aktionen aus den Custom Hooks
  const {
    meters,
    setMeters,
    useDatabase,
    dateRange,
    filterStatus,
    setUseDatabase,
    setDateRange,
    setFilterStatus,
    toast
  } = useMeterData();

  // Erstelle die Aktionen für die Zählerverwaltung mit einer Factory-Funktion
  const {
    handleStorageChange,
    handleAddMeter,
    handleEditMeter,
    handleToggleMeter,
    handleDeleteMeter,
    handleEditReading,
    handleDeleteReading,
    handleUpdateMeterNotes,
    handleUpdateReadingNotes
  } = createMeterActions(meters, setMeters, useDatabase, toast);

  // Effekt zum Initialisieren der Anwendung
  useEffect(() => {
    try {
      console.log("Anwendung wird geladen...");
      
      // Kurze Verzögerung, um zu sehen ob alles korrekt initialisiert wird
      // Dies hilft bei der Fehlerdiagnose in der Produktionsumgebung
      setTimeout(() => {
        setLoading(false);
        console.log("Anwendung erfolgreich geladen");
      }, 1000);
    } catch (err) {
      console.error("Fehler beim Laden der Anwendung:", err);
      setError("Die Anwendung konnte nicht geladen werden. Bitte versuchen Sie es später erneut.");
      setLoading(false);
    }
  }, []);

  // Rendering-Logik für verschiedene Anwendungszustände
  
  // Zeige Ladeanimation während der Initialisierung
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium">Wird geladen...</p>
        </div>
      </div>
    );
  }

  // Zeige Fehleranzeige bei Problemen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Fehler</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  console.log("Rendering Index component with meters:", meters);

  // Hauptlayout der Anwendung
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header mit Datenbank-Toggle */}
        <HeaderSection onStorageChange={(useDb) => {
          setUseDatabase(handleStorageChange(useDb));
        }} />
        
        {/* Filtersektion für Datum und Status */}
        <FilterSection
          dateRange={dateRange}
          filterStatus={filterStatus}
          onDateRangeChange={setDateRange}
          onFilterStatusChange={setFilterStatus}
        />
        
        {/* Zählerliste mit allen notwendigen Event-Handlern */}
        <MeterList
          meters={meters}
          dateRange={dateRange}
          filterStatus={filterStatus}
          onToggleMeter={handleToggleMeter}
          onEditMeter={handleEditMeter}
          onDeleteMeter={handleDeleteMeter}
          onDeleteReading={handleDeleteReading}
          onEditReading={handleEditReading}
          onUpdateMeterNotes={handleUpdateMeterNotes}
          onUpdateReadingNotes={handleUpdateReadingNotes}
        />

        {/* Dialog zum Hinzufügen neuer Zähler */}
        <AddMeterDialog onAddMeter={handleAddMeter} />
      </div>
    </div>
  );
};

export default Index;
