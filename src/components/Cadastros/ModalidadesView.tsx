import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  DollarSign, 
  Calendar, 
  Check, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Trash2,
  TrendingUp,
  Percent,
  X,
  Package
} from 'lucide-react';
import { Modality, BillingType } from '../../types/studio';

interface ModalidadesViewProps {
  modalities: Modality[];
  onAddModality: (modality: Modality) => void;
  onUpdateModality: (modality: Modality) => void;
  onDeleteModality: (modalityId: string) => void;
  onApplyAdjustment: (type: 'percent' | 'fixed', value: number) => void;
  onToggleStatus: (modalityId: string) => void;
}

export const ModalidadesView: React.FC<ModalidadesViewProps> = ({
  modalities,
  onAddModality,
  onUpdateModality,
  onDeleteModality,
  onApplyAdjustment,
  onToggleStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModality, setEditingModality] = useState<Modality | null>(null);

  // Modal de Reajuste Geral (Valor ou %)
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'percent' | 'fixed'>('percent');
  const [adjustmentValue, setAdjustmentValue] = useState<string>('5');

  // Form state
  const [name, setName] = useState('');
  const [billingType, setBillingType] = useState<BillingType>('mensalidade');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(2);
  const [packageClasses, setPackageClasses] = useState<string>('10');
  const [price, setPrice] = useState('');
  const [additionalTeacherFee, setAdditionalTeacherFee] = useState('35.00');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingModality(null);
    setName('');
    setBillingType('mensalidade');
    setDaysPerWeek(2);
    setPackageClasses('10');
    setPrice('');
    setAdditionalTeacherFee('35.00');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mod: Modality) => {
    setEditingModality(mod);
    setName(mod.name);
    setBillingType(mod.billingType);
    setDaysPerWeek(mod.daysPerWeek || 2);
    setPackageClasses(mod.packageClasses ? mod.packageClasses.toString() : '10');
    setPrice(mod.price.toString());
    setAdditionalTeacherFee(mod.additionalTeacherFee ? mod.additionalTeacherFee.toString() : '35.00');
    setDescription(mod.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPkg = billingType === 'pacote' ? (parseInt(packageClasses) || 10) : undefined;

    if (editingModality) {
      const updated: Modality = {
        ...editingModality,
        name: name.trim(),
        billingType,
        daysPerWeek: billingType === 'mensalidade' ? daysPerWeek : 0,
        packageClasses: parsedPkg,
        price: parseFloat(price) || 0,
        additionalTeacherFee: billingType === 'reposicao' ? (parseFloat(additionalTeacherFee) || 0) : undefined,
        description: description || 'Modalidade cadastrada no Studio.',
      };
      onUpdateModality(updated);
    } else {
      const newMod: Modality = {
        id: `mod-${Date.now()}`,
        name: name.trim(),
        billingType,
        daysPerWeek: billingType === 'mensalidade' ? daysPerWeek : 0,
        packageClasses: parsedPkg,
        price: parseFloat(price) || 0,
        additionalTeacherFee: billingType === 'reposicao' ? (parseFloat(additionalTeacherFee) || 0) : undefined,
        description: description || (
          billingType === 'reposicao' 
            ? 'Aula de reposição atendida por outro professor.' 
            : billingType === 'pacote'
            ? `Pacote fechado com ${parsedPkg || 10} aulas/atendimentos.`
            : 'Modalidade cadastrada no Studio.'
        ),
        active: true,
      };
      onAddModality(newMod);
    }

    setIsModalOpen(false);
    setEditingModality(null);
  };

  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(adjustmentValue);
    if (isNaN(val) || val === 0) return;

    onApplyAdjustment(adjustmentType, val);
    setIsAdjustmentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Layers className="w-4 h-4" />
            <span>2.3 Cadastros / Serviços & Planos</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">
            Modalidades de Serviços Ofertados
          </h2>
          <p className="text-xs text-zinc-500">
            Cadastre, edite, exclua ou aplique reajustes em lote (em valor ou %) nas mensalidades e aulas avulsas
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-900 font-semibold text-xs transition-colors shadow-2xs"
            title="Aplicar reajuste em valor (R$) ou porcentagem (%) em todas as modalidades"
          >
            <TrendingUp className="w-4 h-4 text-teal-700" />
            <span>Aplicar Reajuste</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Cadastrar Modalidade</span>
          </button>
        </div>
      </div>

      {/* Modalities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modalities.map((mod) => (
          <div
            key={mod.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              mod.active
                ? 'bg-white border-zinc-200 hover:border-teal-500/80 shadow-2xs'
                : 'bg-zinc-50 border-zinc-200/60 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                  mod.billingType === 'mensalidade'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200/50'
                    : mod.billingType === 'reposicao'
                    ? 'bg-purple-50 text-purple-800 border border-purple-200/50'
                    : mod.billingType === 'pacote'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200/50'
                    : 'bg-amber-50 text-amber-800 border border-amber-200/50'
                }`}>
                  {mod.billingType === 'mensalidade' 
                    ? 'Mensalidade' 
                    : mod.billingType === 'reposicao'
                    ? 'Reposição'
                    : mod.billingType === 'pacote'
                    ? `Pacote (${mod.packageClasses || 10} aulas)`
                    : 'Aula Avulsa'}
                </span>

                <button
                  onClick={() => onToggleStatus(mod.id)}
                  className="text-xs text-zinc-400 hover:text-zinc-700"
                  title="Ativar/Desativar"
                >
                  {mod.active ? (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Ativa</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded">Inativa</span>
                  )}
                </button>
              </div>

              <h3 className="text-base font-bold text-zinc-900 mb-1">
                {mod.name}
              </h3>

              <p className="text-xs text-zinc-600 line-clamp-2 mb-3 leading-relaxed">
                {mod.description}
              </p>

              {mod.billingType === 'reposicao' ? (
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/60 my-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                    Comissão do Professor Substituto
                  </span>
                  <div className="text-lg font-bold font-mono text-purple-950 mt-0.5">
                    + R$ {(mod.additionalTeacherFee || 0).toFixed(2)}
                  </div>
                  <p className="text-[10px] text-purple-700/80 mt-0.5">
                    Valor adicional creditado quando a reposição é em outro professor
                  </p>
                </div>
              ) : mod.billingType === 'pacote' ? (
                <div className="my-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-mono text-zinc-900 tabular-nums">
                      R$ {mod.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      / pacote total
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-blue-900 font-semibold">
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mod.packageClasses || 10} aulas / atendimentos</span>
                    {mod.packageClasses && mod.packageClasses > 0 && (
                      <span className="text-zinc-500 font-normal">
                        (R$ {(mod.price / mod.packageClasses).toFixed(2)}/aula)
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-2xl font-extrabold font-mono text-zinc-900 tabular-nums">
                    R$ {mod.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {mod.billingType === 'mensalidade' ? '/mês' : '/sessão'}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions: Edit and Delete */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1.5 text-[11px]">
                {mod.billingType === 'pacote' ? (
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                )}
                <span>
                  {mod.billingType === 'mensalidade'
                    ? `${mod.daysPerWeek} dias/semana`
                    : mod.billingType === 'reposicao'
                    ? 'Reposição'
                    : mod.billingType === 'pacote'
                    ? `${mod.packageClasses || 10} aulas (Pacote Total)`
                    : 'Aula Avulsa'}
                </span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(mod)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                  title="Editar Modalidade"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Deseja realmente excluir a modalidade "${mod.name}"?`)) {
                      onDeleteModality(mod.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Excluir Modalidade"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Cadastrar ou Editar Modalidade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-zinc-950 text-teal-400">
                  {editingModality ? <Edit3 className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingModality ? 'Editar Modalidade' : 'Cadastrar Modalidade de Serviço'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Defina o formato, frequência semanal e precificação
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Nome da Modalidade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pilates em Aparelhos (2x na semana)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Tipo de Cobrança / Atendimento *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBillingType('mensalidade')}
                    className={`py-2 px-1 text-center rounded-lg border font-semibold text-[11px] transition-colors ${
                      billingType === 'mensalidade'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    Mensalidade
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingType('aula_avulsa')}
                    className={`py-2 px-1 text-center rounded-lg border font-semibold text-[11px] transition-colors ${
                      billingType === 'aula_avulsa'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    Aula Avulsa
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingType('pacote')}
                    className={`py-2 px-1 text-center rounded-lg border font-semibold text-[11px] transition-colors ${
                      billingType === 'pacote'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    Pacote
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingType('reposicao')}
                    className={`py-2 px-1 text-center rounded-lg border font-semibold text-[11px] transition-colors ${
                      billingType === 'reposicao'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-2xs'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    Reposição
                  </button>
                </div>
              </div>

              {billingType === 'pacote' && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-blue-950 font-bold block text-xs">
                      Quantidade de Aulas / Atendimentos no Pacote *
                    </label>
                    <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/70 px-2 py-0.5 rounded">
                      Pacote Fechado
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    placeholder="10"
                    value={packageClasses}
                    onChange={(e) => setPackageClasses(e.target.value)}
                    className="w-full bg-white border border-blue-300 rounded-lg p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold text-sm"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-blue-800 font-medium">Atalhos rápidos:</span>
                    {[5, 10, 12, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPackageClasses(num.toString())}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          packageClasses === num.toString()
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white border border-blue-200 text-blue-800 hover:bg-blue-100'
                        }`}
                      >
                        {num} aulas
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-blue-800 leading-tight">
                    O aluno adquire este pacote fechado com a quantidade pré-determinada de sessões.
                  </p>
                </div>
              )}

              {billingType === 'mensalidade' && (
                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">
                    Quantidade de Dias na Semana
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDaysPerWeek(d)}
                        className={`py-2 rounded-lg border text-center font-bold ${
                          daysPerWeek === d
                            ? 'bg-zinc-950 text-white border-zinc-950'
                            : 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {d}x
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {billingType === 'reposicao' && (
                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <label className="text-purple-950 font-bold block text-xs">
                    Valor Adicional na Comissão do Professor Substituto (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="35.00"
                    value={additionalTeacherFee}
                    onChange={(e) => setAdditionalTeacherFee(e.target.value)}
                    className="w-full bg-white border border-purple-300 rounded-lg p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-purple-600 font-mono font-bold text-sm"
                  />
                  <p className="text-[11px] text-purple-800 leading-tight">
                    Este valor será somado diretamente na comissão do professor que realizar a reposição de um aluno remarcado de outro professor.
                  </p>
                </div>
              )}

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  {billingType === 'mensalidade' 
                    ? 'Valor da Mensalidade (R$) *' 
                    : billingType === 'reposicao' 
                    ? 'Valor Cobrado do Aluno (R$ - 0 se inclusa) *' 
                    : billingType === 'pacote'
                    ? 'Valor Total do Pacote (R$) *'
                    : 'Valor da Aula Avulsa (R$) *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder={
                    billingType === 'reposicao' 
                      ? '0.00' 
                      : billingType === 'pacote'
                      ? '1100.00'
                      : '380.00'
                  }
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                />
                {billingType === 'pacote' && parseFloat(price) > 0 && parseInt(packageClasses) > 0 && (
                  <p className="text-[11px] text-blue-700 font-medium mt-1.5 flex items-center gap-1">
                    <span>💡</span>
                    <span>
                      Equivalente a <strong className="font-bold">R$ {(parseFloat(price) / parseInt(packageClasses)).toFixed(2)}</strong> por aula / atendimento.
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Descrição do Serviço / Aparelhos
                </label>
                <textarea
                  placeholder="Ex: Aulas personalizadas de Pilates nos aparelhos Reformer, Cadillac e Chair..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors shadow-2xs"
                >
                  {editingModality ? 'Salvar Alterações' : 'Salvar Modalidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Aplicar Reajuste Geral (Valor ou %) */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Reajuste de Valores
                </h3>
                <p className="text-xs text-zinc-500">
                  Aplicar reajuste em todas as modalidades ativas
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmAdjustment} className="py-4 space-y-4">
              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Forma do Reajuste *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('percent')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      adjustmentType === 'percent'
                        ? 'bg-teal-600 text-white border-teal-600 font-bold'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Porcentagem (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('fixed')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      adjustmentType === 'fixed'
                        ? 'bg-teal-600 text-white border-teal-600 font-bold'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Valor Fixo (R$)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  {adjustmentType === 'percent' ? 'Percentual de Reajuste (%) *' : 'Valor do Acréscimo (R$) *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder={adjustmentType === 'percent' ? 'Ex: 5 para +5%' : 'Ex: 20 para +R$ 20,00'}
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 font-bold font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  {adjustmentType === 'percent'
                    ? `Exemplo: R$ 380,00 passará para R$ ${(380 * (1 + (parseFloat(adjustmentValue) || 0) / 100)).toFixed(2)}`
                    : `Exemplo: R$ 380,00 passará para R$ ${(380 + (parseFloat(adjustmentValue) || 0)).toFixed(2)}`}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold transition-colors shadow-2xs"
                >
                  Aplicar Reajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
