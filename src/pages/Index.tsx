
import { useState, useEffect } from "react";
import { AddMeterDialog } from "@/components/AddMeterDialog";
import { FilterSection } from "@/components/FilterSection";
import { HeaderSection } from "@/components/HeaderSection";
import { MeterList } from "@/components/MeterList";
import { useMeterData } from "@/hooks/useMeterData";
import { createMeterActions } from "@/actions/meterActions";

// Hauptkomponente für die Zählerverwaltung
const Index = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hole State und Aktionen aus den Custom Hooks
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

  // Erstelle die Aktionen für die Zählerverwaltung
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

  useEffect(() => {
    // Simuliere Ladevorgang und fange mögliche Fehler ab
    try {
      console.log("Anwendung wird geladen...");
      setLoading(false);
    } catch (err) {
      console.error("Fehler beim Laden der Anwendung:", err);
      setError("Die Anwendung konnte nicht geladen werden. Bitte versuchen Sie es später erneut.");
      setLoading(false);
    }
  }, []);

  // Zeige Lade- oder Fehleranzeige
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeaderSection onStorageChange={(useDb) => {
          setUseDatabase(handleStorageChange(useDb));
        }} />
        
        <FilterSection
          dateRange={dateRange}
          filterStatus={filterStatus}
          onDateRangeChange={setDateRange}
          onFilterStatusChange={setFilterStatus}
        />
        
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

        <AddMeterDialog onAddMeter={handleAddMeter} />
      </div>
    </div>
  );
};

export default Index;
