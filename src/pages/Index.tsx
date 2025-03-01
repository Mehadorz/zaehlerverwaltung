
import { useState } from "react";
import { AddMeterDialog } from "@/components/AddMeterDialog";
import { FilterSection } from "@/components/FilterSection";
import { HeaderSection } from "@/components/HeaderSection";
import { MeterList } from "@/components/MeterList";
import { useMeterData } from "@/hooks/useMeterData";
import { createMeterActions } from "@/actions/meterActions";

// Hauptkomponente für die Zählerverwaltung
const Index = () => {
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
