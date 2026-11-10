import React, { useState } from 'react';
import { 
  Dumbbell, 
  ShieldCheck, 
  AlertTriangle, 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  Plus
} from 'lucide-react';
import { Equipment } from '../types/pilates';

interface EquipmentViewProps {
  equipment: Equipment[];
  onUpdateEquipment: (updated: Equipment[]) => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({
  equipment,
  onUpdateEquipment,
}) => {
  const [selectedEqId, setSelectedEqId] = useState<string | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  const handleRegisterMaintenance = (id: string) => {
    const updated = equipment.map((eq) => {
      if (eq.id === id) {
        return {
          ...eq,
          lastMaintenance: new Date().toISOString().split('T')[0],
          condition: 'excellent' as const,
          notes: maintenanceNotes ? `${maintenanceNotes} (Inspecionado em ${new Date().toISOString().split('T')[0]})` : eq.notes,
        };
      }
      return eq;
    });

    onUpdateEquipment(updated);
    setSelectedEqId(null);
    setMaintenanceNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Aparelhos, Molas & Segurança do Studio
            </h2>
            <p className="text-xs text-stone-500">
              Controle de tensão de molas (Amarela, Azul, Vermelha, Verde), estofados e travas dos aparelhos
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Rotina de Inspeção Preventiva Ativa</span>
          </div>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((item) => {
          const isSelected = selectedEqId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5 flex flex-col justify-between hover:border-stone-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        {item.name}
                      </h3>
                      <span className="text-[11px] text-stone-500 capitalize">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Operacional
                  </span>
                </div>

                <p className="text-xs text-stone-600 my-3 leading-relaxed">
                  {item.notes}
                </p>

                {/* Springs Mapping */}
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-100 space-y-1.5 mb-3 text-xs">
                  <span className="text-[11px] font-semibold text-stone-700 block">
                    Kit de Molas & Resistência:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500" />
                      <span>Amarela (Leve): <strong>{item.springsCount.yellow}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-600" />
                      <span>Azul (Média): <strong>{item.springsCount.blue}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600" />
                      <span>Vermelha: <strong>{item.springsCount.red}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-emerald-700" />
                      <span>Verde (Pesada): <strong>{item.springsCount.green}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Maintenance Dates */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Última revisão: <strong>{item.lastMaintenance}</strong></span>
                  <span>Próxima: <strong>{item.nextMaintenance}</strong></span>
                </div>
              </div>

              {/* Maintenance action button */}
              <div className="pt-3 mt-4 border-t border-stone-100">
                {isSelected ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Observações da inspeção..."
                      value={maintenanceNotes}
                      onChange={(e) => setMaintenanceNotes(e.target.value)}
                      className="w-full p-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md text-stone-800"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedEqId(null)}
                        className="px-2.5 py-1 text-xs text-stone-500 hover:bg-stone-100 rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleRegisterMaintenance(item.id)}
                        className="px-3 py-1 text-xs font-semibold bg-emerald-800 text-white rounded hover:bg-emerald-700"
                      >
                        Confirmar Revisão
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedEqId(item.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5 text-stone-500" />
                    <span>Registrar Inspeção de Molas</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
