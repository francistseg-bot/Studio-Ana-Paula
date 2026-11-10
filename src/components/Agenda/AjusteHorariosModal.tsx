import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Settings, 
  Calendar, 
  Check, 
  User, 
  Users,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Instructor, StudioOperatingConfig, DayScheduleHours } from '../../types/studio';

interface AjusteHorariosModalProps {
  config: StudioOperatingConfig;
  instructors: Instructor[];
  onSave: (newConfig: StudioOperatingConfig) => void;
  onClose: () => void;
}

export const AjusteHorariosModal: React.FC<AjusteHorariosModalProps> = ({
  config,
  instructors,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'professores'>('studio');
  const [studioHours, setStudioHours] = useState<DayScheduleHours[]>(
    JSON.parse(JSON.stringify(config.studioHours))
  );
  const [defaultCapacity, setDefaultCapacity] = useState<number>(config.defaultCapacity || 4);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>(
    instructors[0]?.id || ''
  );
  const [instructorCustomHours, setInstructorCustomHours] = useState<Record<string, DayScheduleHours[]>>(
    JSON.parse(JSON.stringify(config.instructorCustomHours || {}))
  );

  // Time options
  const TIME_OPTIONS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
    '20:00', '21:00', '22:00'
  ];

  // Current instructor schedule
  const currentInstSchedule: DayScheduleHours[] = 
    instructorCustomHours[selectedInstructorId] || 
    JSON.parse(JSON.stringify(studioHours));

  const handleUpdateStudioDay = (dayOfWeek: number, field: keyof DayScheduleHours, value: any) => {
    setStudioHours(prev => prev.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d));
  };

  const handleUpdateInstructorDay = (dayOfWeek: number, field: keyof DayScheduleHours, value: any) => {
    const updatedSchedule = currentInstSchedule.map(d => 
      d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
    );
    setInstructorCustomHours(prev => ({
      ...prev,
      [selectedInstructorId]: updatedSchedule
    }));
  };

  const handleResetInstructorToStudio = () => {
    setInstructorCustomHours(prev => {
      const next = { ...prev };
      delete next[selectedInstructorId];
      return next;
    });
  };

  const handleSaveAll = () => {
    onSave({
      defaultCapacity,
      studioHours,
      instructorCustomHours,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-950 text-teal-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Ajuste de Horários de Atendimento & Grade
              </h3>
              <p className="text-[11px] text-zinc-500">
                Configure os horários de funcionamento do Studio e personalize a grade por professor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Geral do Studio vs Personalizado por Professor */}
        <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl mb-4 shrink-0">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-2 text-center rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'studio'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-teal-600" />
            <span>1. Horário Geral do Studio & Lotação</span>
          </button>

          <button
            onClick={() => setActiveTab('professores')}
            className={`flex-1 py-2 text-center rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'professores'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span>2. Horários Personalizados por Professor</span>
          </button>
        </div>

        {/* Tab 1: Studio Geral */}
        {activeTab === 'studio' && (
          <div className="overflow-y-auto pr-1 space-y-4 flex-1">
            
            {/* Lotação máxima por horário */}
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-zinc-900 block text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span>Capacidade Máxima por Horário com o Mesmo Professor:</span>
                </span>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Conforme solicitado, a plataforma permite alocar até 4 alunos por horário (1 por aparelho).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={defaultCapacity}
                  onChange={(e) => setDefaultCapacity(Number(e.target.value))}
                  className="bg-white border border-teal-300 rounded-lg px-3 py-1.5 font-bold font-mono text-teal-950 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value={1}>1 aluno (Individual)</option>
                  <option value={2}>2 alunos (Dupla)</option>
                  <option value={3}>3 alunos (Trio)</option>
                  <option value={4}>4 alunos (Até 4 alunos - Padrão Studio)</option>
                </select>
              </div>
            </div>

            {/* Dias da Semana e Faixas de Horário */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Dias de Funcionamento & Faixa de Atendimento
              </span>

              <div className="space-y-2">
                {studioHours.map((day) => (
                  <div
                    key={day.dayOfWeek}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      day.enabled 
                        ? 'bg-white border-zinc-200' 
                        : 'bg-zinc-50 border-zinc-200/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-900">
                        <input
                          type="checkbox"
                          checked={day.enabled}
                          onChange={(e) => handleUpdateStudioDay(day.dayOfWeek, 'enabled', e.target.checked)}
                          className="accent-teal-600 rounded w-4 h-4"
                        />
                        <span>{day.dayName}</span>
                      </label>
                      {!day.enabled && (
                        <span className="text-[10px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded font-medium">
                          Fechado
                        </span>
                      )}
                    </div>

                    {day.enabled && (
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Das</span>
                        <select
                          value={day.startTime}
                          onChange={(e) => handleUpdateStudioDay(day.dayOfWeek, 'startTime', e.target.value)}
                          className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 font-mono font-semibold text-zinc-800"
                        >
                          {TIME_OPTIONS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <span className="text-zinc-500">às</span>
                        <select
                          value={day.endTime}
                          onChange={(e) => handleUpdateStudioDay(day.dayOfWeek, 'endTime', e.target.value)}
                          className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 font-mono font-semibold text-zinc-800"
                        >
                          {TIME_OPTIONS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Personalizado por Professor */}
        {activeTab === 'professores' && (
          <div className="overflow-y-auto pr-1 space-y-4 flex-1">
            
            {/* Seletor de Professor */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-zinc-900 font-bold block text-xs">
                  Selecione o Professor / Instrutor:
                </label>
                <p className="text-[11px] text-zinc-500">
                  Configure dias e horários específicos em que este profissional atende no Studio
                </p>
              </div>

              <select
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                className="bg-white border border-zinc-300 rounded-lg p-2 font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.councilNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Aviso de personalização */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                {instructorCustomHours[selectedInstructorId] 
                  ? 'Este professor possui horários personalizados.' 
                  : 'Este professor está seguindo os horários gerais do Studio.'}
              </span>
              {instructorCustomHours[selectedInstructorId] && (
                <button
                  type="button"
                  onClick={handleResetInstructorToStudio}
                  className="flex items-center gap-1 text-[11px] text-rose-600 hover:underline font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar Padrão do Studio</span>
                </button>
              )}
            </div>

            {/* Grade do Professor Selecionado */}
            <div className="space-y-2">
              {currentInstSchedule.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    day.enabled 
                      ? 'bg-white border-zinc-200' 
                      : 'bg-zinc-50 border-zinc-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-900">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={(e) => handleUpdateInstructorDay(day.dayOfWeek, 'enabled', e.target.checked)}
                        className="accent-teal-600 rounded w-4 h-4"
                      />
                      <span>{day.dayName}</span>
                    </label>
                    {!day.enabled && (
                      <span className="text-[10px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded font-medium">
                        Não atende neste dia
                      </span>
                    )}
                  </div>

                  {day.enabled && (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">Das</span>
                      <select
                        value={day.startTime}
                        onChange={(e) => handleUpdateInstructorDay(day.dayOfWeek, 'startTime', e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 font-mono font-semibold text-zinc-800"
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span className="text-zinc-500">às</span>
                      <select
                        value={day.endTime}
                        onChange={(e) => handleUpdateInstructorDay(day.dayOfWeek, 'endTime', e.target.value)}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 font-mono font-semibold text-zinc-800"
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between mt-4">
          <span className="text-[11px] text-zinc-500">
            As alterações passam a valer imediatamente na Agenda.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors shadow-2xs"
            >
              Salvar Configuração de Horários
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
