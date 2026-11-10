import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Check, 
  Save, 
  Clock, 
  Phone, 
  MapPin, 
  FileCheck, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { CompanyData } from '../../types/studio';
import { INITIAL_COMPANY_DATA } from '../../data/studioData';

interface EmpresaViewProps {
  companyData: CompanyData;
  onSaveCompanyData: (updated: CompanyData) => void;
}

export const EmpresaView: React.FC<EmpresaViewProps> = ({
  companyData,
  onSaveCompanyData,
}) => {
  const [formData, setFormData] = useState<CompanyData>(companyData);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInsertTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      contractTemplate: prev.contractTemplate + ' ' + tag,
    }));
  };

  const handleResetTemplate = () => {
    if (confirm('Deseja restaurar o modelo de contrato padrão de Pilates e Fisioterapia?')) {
      setFormData(prev => ({
        ...prev,
        contractTemplate: INITIAL_COMPANY_DATA.contractTemplate,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompanyData(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const DYNAMIC_TAGS = [
    { tag: '{{NOME_ALUNO}}', label: 'Nome do Aluno' },
    { tag: '{{CPF_ALUNO}}', label: 'CPF do Aluno' },
    { tag: '{{ENDERECO_ALUNO}}', label: 'Endereço do Aluno' },
    { tag: '{{TELEFONE_ALUNO}}', label: 'Telefone do Aluno' },
    { tag: '{{EMAIL_ALUNO}}', label: 'E-mail do Aluno' },
    { tag: '{{DATA_NASCIMENTO}}', label: 'Data de Nascimento' },
    { tag: '{{PROFISSAO_ALUNO}}', label: 'Profissão' },
    { tag: '{{CONTATO_EMERGENCIA}}', label: 'Contato Emergência' },
    { tag: '{{MODALIDADE_NOME}}', label: 'Nome da Modalidade' },
    { tag: '{{DIAS_SEMANA}}', label: 'Qtd Dias (ex: 2)' },
    { tag: '{{DIAS_ESCOLHIDOS}}', label: 'Dias (ex: Terça, Quinta)' },
    { tag: '{{HORARIO_AULA}}', label: 'Horário da Aula' },
    { tag: '{{PROFESSOR_RESPONSAVEL}}', label: 'Nome do Professor' },
    { tag: '{{VALOR_MENSALIDADE}}', label: 'Valor da Mensalidade' },
    { tag: '{{DIA_VENCIMENTO}}', label: 'Dia Vencimento' },
    { tag: '{{OBSERVACOES_CLINICAS}}', label: 'Patologias / Observações' },
    { tag: '{{TERMO_USO_IMAGEM}}', label: 'Consentimento Uso de Imagem (Sim/Não)' },
    { tag: '{{TERMO_ATESTADO_MEDICO}}', label: 'Ciência Atestado Anual (Sim/Não)' },
    { tag: '{{DATA_ATUAL}}', label: 'Data Atual Formatada' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Building2 className="w-4 h-4" />
            <span>2.1 Cadastros / Dados da Empresa</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">
            Dados Cadastrais da Empresa & Modelo de Contrato
          </h2>
          <p className="text-xs text-zinc-500">
            Configure a Razão Social, CNPJ, horários e edite o modelo padrão de contrato emitido para os alunos
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Dados salvos com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Seção 1: Dados Cadastrais da Empresa */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Building2 className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-zinc-900">
              1. Identificação Jurídica & Contato do Studio
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                required
                value={formData.corporateName}
                onChange={(e) => handleChange('corporateName', e.target.value)}
                placeholder="Studio Ana Paula Rodrigues Pilates e Fisioterapia LTDA"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
              />
            </div>

            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                Nome Fantasia *
              </label>
              <input
                type="text"
                required
                value={formData.tradeName}
                onChange={(e) => handleChange('tradeName', e.target.value)}
                placeholder="Studio Ana Paula Rodrigues"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
              />
            </div>

            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                required
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                Telefone / WhatsApp do Studio *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 98765-1234"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-zinc-700 font-semibold block mb-1">
                Endereço Completo do Studio *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Av. Paulista, 1842 - Conjunto 74 - Bela Vista, São Paulo - SP, CEP 01310-200"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                E-mail Institucional
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contato@studiopilates.com.br"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                Horários de Atendimento *
              </label>
              <input
                type="text"
                required
                value={formData.businessHours}
                onChange={(e) => handleChange('businessHours', e.target.value)}
                placeholder="Segunda a Sexta das 07:00 às 20:00 | Sábados das 08:00 às 12:00"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Modelo Padrão de Contrato */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-700" />
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  2. Modelo Padrão de Contrato de Prestação de Serviços
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Este contrato é emitido automaticamente com os dados preenchidos ao cadastrar ou gerenciar um aluno
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-medium self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Modelo Padrão</span>
            </button>
          </div>

          {/* Tags de substituição rápida */}
          <div>
            <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1.5">
              Tags Dinâmicas Disponíveis (clique para inserir no contrato):
            </span>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
              {DYNAMIC_TAGS.map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => handleInsertTag(item.tag)}
                  className="px-2 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 hover:border-teal-500 hover:text-teal-900 transition-colors text-[10px] font-mono flex items-center gap-1"
                  title={`Inserir ${item.label}`}
                >
                  <span className="font-bold text-teal-700">{item.tag}</span>
                  <span className="text-zinc-400">({item.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Textarea do Modelo */}
          <div>
            <textarea
              rows={16}
              required
              value={formData.contractTemplate}
              onChange={(e) => handleChange('contractTemplate', e.target.value)}
              className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl p-4 text-zinc-900 font-mono text-[11px] leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-inner"
            />
          </div>
        </div>

        {/* Botão de Salvar Geral */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Dados da Empresa & Modelo de Contrato</span>
          </button>
        </div>

      </form>

    </div>
  );
};
