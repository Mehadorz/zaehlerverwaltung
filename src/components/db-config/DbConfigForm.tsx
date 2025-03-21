
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { DbConfig } from "@/services/databaseService";

interface DbConfigFormProps {
  config: DbConfig;
  onChange: (field: keyof DbConfig, value: string) => void;
}

export function DbConfigForm({ config, onChange }: DbConfigFormProps) {
  return (
    <div className="grid gap-4 py-4">
      {/* Recommended configuration */}
      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-700">
          <strong>Empfohlene Konfiguration:</strong><br/>
          <span className="font-bold">Lokale Umgebung:</span><br/>
          Host: localhost<br/>
          Port: 3306<br/>
          Benutzername: meter_user<br/>
          Passwort: meter_password<br/>
          Datenbank: meter_db<br/><br/>
          
          <span className="font-bold">Docker-Umgebung:</span><br/>
          Host: db<br/>
          Port: 3306<br/>
          Benutzername: meter_user<br/>
          Passwort: meter_password<br/>
          Datenbank: meter_db
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="host" className="text-right">
          Host
        </Label>
        <Input
          id="host"
          value={config.host}
          onChange={(e) => onChange('host', e.target.value)}
          className="col-span-3"
          placeholder="localhost oder db (bei Docker)"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="port" className="text-right">
          Port
        </Label>
        <Input
          id="port"
          type="number"
          value={config.port}
          onChange={(e) => onChange('port', e.target.value)}
          className="col-span-3"
          placeholder="3306"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Benutzername
        </Label>
        <Input
          id="username"
          value={config.username}
          onChange={(e) => onChange('username', e.target.value)}
          className="col-span-3"
          placeholder="meter_user"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="password" className="text-right">
          Passwort
        </Label>
        <Input
          id="password"
          type="password"
          value={config.password}
          onChange={(e) => onChange('password', e.target.value)}
          className="col-span-3"
          placeholder="•••••••••"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="database" className="text-right">
          Datenbank
        </Label>
        <Input
          id="database"
          value={config.database}
          onChange={(e) => onChange('database', e.target.value)}
          className="col-span-3"
          placeholder="meter_db"
        />
      </div>
    </div>
  );
}
