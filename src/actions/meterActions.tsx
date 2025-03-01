
import { Meter, Reading } from "@/hooks/useMeterData";
import { databaseService } from "@/services/databaseService";

export function createMeterActions(
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: any
) {
  const handleStorageChange = (useDb: boolean) => {
    localStorage.setItem("storagePreference", JSON.stringify(useDb));
    return useDb;
  };

  const handleAddMeter = async (name: string, unit: string) => {
    const newMeter: Omit<Meter, 'id'> = {
      name,
      unit,
      isActive: true,
      readings: [],
    };

    if (useDatabase) {
      const addedMeter = await databaseService.addMeter(newMeter);
      if (addedMeter) {
        setMeters(prev => [...prev, addedMeter]);
      }
    } else {
      const meterWithId: Meter = {
        ...newMeter,
        id: crypto.randomUUID(),
      };
      setMeters(prev => [...prev, meterWithId]);
      localStorage.setItem("meters", JSON.stringify([...meters, meterWithId]));
    }

    toast({
      title: "Zähler hinzugefügt",
      description: `${name} wurde erfolgreich hinzugefügt.`,
      duration: 10000,
    });
  };

  const handleEditMeter = async (id: string, name: string, unit: string) => {
    if (useDatabase) {
      const meterToUpdate = meters.find(m => m.id === id);
      if (meterToUpdate) {
        const updatedMeter = { ...meterToUpdate, name, unit };
        const success = await databaseService.updateMeter(updatedMeter);
        if (success) {
          setMeters(prev => prev.map(meter => 
            meter.id === id ? { ...meter, name, unit } : meter
          ));
        }
      }
    } else {
      setMeters(prev => prev.map(meter => 
        meter.id === id ? { ...meter, name, unit } : meter
      ));
      localStorage.setItem("meters", JSON.stringify(meters.map(meter => 
        meter.id === id ? { ...meter, name, unit } : meter
      )));
    }
    
    toast({
      title: "Zähler bearbeitet",
      description: `Zähler wurde erfolgreich aktualisiert.`,
      duration: 10000,
    });
  };

  const handleToggleMeter = async (id: string, isActive: boolean) => {
    if (useDatabase) {
      const meterToUpdate = meters.find(m => m.id === id);
      if (meterToUpdate) {
        const updatedMeter = { ...meterToUpdate, isActive };
        const success = await databaseService.updateMeter(updatedMeter);
        if (success) {
          setMeters(prev => prev.map(meter => 
            meter.id === id ? { ...meter, isActive } : meter
          ));
        }
      }
    } else {
      setMeters(prev => prev.map(meter => 
        meter.id === id ? { ...meter, isActive } : meter
      ));
      localStorage.setItem("meters", JSON.stringify(meters.map(meter => 
        meter.id === id ? { ...meter, isActive } : meter
      )));
    }
    
    toast({
      title: "Status aktualisiert",
      description: `Zähler wurde ${isActive ? 'aktiviert' : 'deaktiviert'}.`,
      duration: 10000,
    });
  };

  const handleDeleteMeter = async (id: string) => {
    if (useDatabase) {
      const success = await databaseService.deleteMeter(id);
      if (success) {
        setMeters(prev => prev.filter(meter => meter.id !== id));
      }
    } else {
      setMeters(prev => prev.filter(meter => meter.id !== id));
      localStorage.setItem("meters", JSON.stringify(meters.filter(meter => meter.id !== id)));
    }
    
    toast({
      title: "Zähler gelöscht",
      description: "Der Zähler wurde erfolgreich gelöscht.",
      variant: "destructive",
      duration: 10000,
    });
  };

  const handleEditReading = async (meterId: string, date: string, value: number) => {
    if (useDatabase) {
      const success = await databaseService.addOrUpdateReading(meterId, date, value);
      if (success) {
        setMeters(prev => prev.map(meter => {
          if (meter.id === meterId) {
            const existingReadingIndex = meter.readings.findIndex(r => r.date === date);
            let newReadings;
            
            if (existingReadingIndex >= 0) {
              newReadings = [...meter.readings];
              newReadings[existingReadingIndex] = { 
                date, 
                value,
                notes: meter.readings[existingReadingIndex].notes 
              };
            } else {
              newReadings = [...meter.readings, { date, value }];
            }
            
            newReadings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return { ...meter, readings: newReadings };
          }
          return meter;
        }));
      }
    } else {
      setMeters(prev => prev.map(meter => {
        if (meter.id === meterId) {
          const existingReadingIndex = meter.readings.findIndex(r => r.date === date);
          let newReadings;
          
          if (existingReadingIndex >= 0) {
            newReadings = [...meter.readings];
            newReadings[existingReadingIndex] = { 
              date, 
              value,
              notes: meter.readings[existingReadingIndex].notes 
            };
          } else {
            newReadings = [...meter.readings, { date, value }];
          }
          
          newReadings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return { ...meter, readings: newReadings };
        }
        return meter;
      }));
      
      localStorage.setItem("meters", JSON.stringify(meters));
    }
    
    toast({
      title: "Zählerstand aktualisiert",
      description: "Der Zählerstand wurde erfolgreich aktualisiert.",
      duration: 10000,
    });
  };

  const handleDeleteReading = async (meterId: string, date: string) => {
    if (useDatabase) {
      const success = await databaseService.deleteReading(meterId, date);
      if (success) {
        setMeters(prev => prev.map(meter => {
          if (meter.id === meterId) {
            return {
              ...meter,
              readings: meter.readings.filter(r => r.date !== date),
            };
          }
          return meter;
        }));
      }
    } else {
      setMeters(prev => prev.map(meter => {
        if (meter.id === meterId) {
          return {
            ...meter,
            readings: meter.readings.filter(r => r.date !== date),
          };
        }
        return meter;
      }));
      
      localStorage.setItem("meters", JSON.stringify(meters));
    }
    
    toast({
      title: "Zählerstand gelöscht",
      description: "Der Zählerstand wurde erfolgreich gelöscht.",
      variant: "destructive",
      duration: 10000,
    });
  };

  const handleUpdateMeterNotes = async (id: string, notes: string) => {
    if (useDatabase) {
      const success = await databaseService.updateMeterNotes(id, notes);
      if (success) {
        setMeters(prev => prev.map(meter => 
          meter.id === id ? { ...meter, notes } : meter
        ));
      }
    } else {
      setMeters(prev => prev.map(meter => 
        meter.id === id ? { ...meter, notes } : meter
      ));
      localStorage.setItem("meters", JSON.stringify(meters));
    }
    
    toast({
      title: "Notizen aktualisiert",
      description: "Die Notizen wurden erfolgreich gespeichert.",
      duration: 10000,
    });
  };

  const handleUpdateReadingNotes = async (meterId: string, date: string, notes: string) => {
    if (useDatabase) {
      const success = await databaseService.updateReadingNotes(meterId, date, notes);
      if (success) {
        setMeters(prev => prev.map(meter => {
          if (meter.id === meterId) {
            return {
              ...meter,
              readings: meter.readings.map(reading =>
                reading.date === date ? { ...reading, notes } : reading
              )
            };
          }
          return meter;
        }));
      }
    } else {
      setMeters(prev => prev.map(meter => {
        if (meter.id === meterId) {
          return {
            ...meter,
            readings: meter.readings.map(reading =>
              reading.date === date ? { ...reading, notes } : reading
            )
          };
        }
        return meter;
      }));
      
      localStorage.setItem("meters", JSON.stringify(meters));
    }
    
    toast({
      title: "Notizen aktualisiert",
      description: "Die Notizen wurden erfolgreich gespeichert.",
      duration: 10000,
    });
  };

  return {
    handleStorageChange,
    handleAddMeter,
    handleEditMeter,
    handleToggleMeter,
    handleDeleteMeter,
    handleEditReading,
    handleDeleteReading,
    handleUpdateMeterNotes,
    handleUpdateReadingNotes
  };
}
