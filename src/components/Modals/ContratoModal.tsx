import React, { useRef, useState } from 'react';
import { X, Printer, Copy, Check, FileCheck, Building2, PenTool, Trash2, Save } from 'lucide-react';
import { Student, CompanyData } from '../../types/studio';
import SignatureCanvas from 'react-signature-canvas';

interface ContratoModalProps {
  student: Student;
  companyData: CompanyData;
  onClose: () => void;
  onSaveSignature?: (signature: string) => void;
}

export function generateContractText(student: Student, company: CompanyData): string {
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const enrollment = student.enrollment;

  let text = company.contractTemplate;

  // Replacements
  text = text.replace(/{{EMPRESA_RAZAO_SOCIAL}}/g, company.corporateName || 'Studio Ana Paula Rodrigues Pilates e Fisioterapia LTDA');
  text = text.replace(/{{EMPRESA_NOME_FANTASIA}}/g, company.tradeName || 'Studio Ana Paula Rodrigues');
  text = text.replace(/{{EMPRESA_CNPJ}}/g, company.cnpj || '38.452.190/0001-82');
  text = text.replace(/{{EMPRESA_ENDERECO}}/g, company.address || 'Av. Paulista, 1842 - Conjunto 74');
  text = text.replace(/{{EMPRESA_TELEFONE}}/g, company.phone || '(11) 98765-1234');

  text = text.replace(/{{NOME_ALUNO}}/g, student.name);
  text = text.replace(/{{CPF_ALUNO}}/g, student.cpf || 'Não cadastrado');
  text = text.replace(/{{DATA_NASCIMENTO}}/g, student.birthDate || 'Não informada');
  text = text.replace(/{{ENDERECO_ALUNO}}/g, student.address || 'Endereço não informado');
  text = text.replace(/{{TELEFONE_ALUNO}}/g, student.phone);
  text = text.replace(/{{EMAIL_ALUNO}}/g, student.email || 'Não informado');
  text = text.replace(/{{PROFISSAO_ALUNO}}/g, student.profession || 'Não informada');
  text = text.replace(/{{CONTATO_EMERGENCIA}}/g, student.emergencyContact || 'Não informado');
  text = text.replace(/{{TEL_EMERGENCIA}}/g, student.emergencyPhone || 'Não informado');
  text = text.replace(/{{OBSERVACOES_CLINICAS}}/g, student.observations || 'Nenhuma restrição registrada.');

  text = text.replace(/{{MODALIDADE_NOME}}/g, enrollment?.modalityName || 'Pilates em Aparelhos');
  text = text.replace(/{{DIAS_SEMANA}}/g, String(enrollment?.daysPerWeek || 2));
  text = text.replace(/{{DIAS_ESCOLHIDOS}}/g, enrollment?.scheduleDays.join(', ') || 'A combinar');
  text = text.replace(/{{HORARIO_AULA}}/g, enrollment?.scheduleTime || 'A combinar');
  text = text.replace(/{{PROFESSOR_RESPONSAVEL}}/g, enrollment?.instructorName || 'Dra. Ana Paula Rodrigues');
  text = text.replace(/{{VALOR_MENSALIDADE}}/g, enrollment?.monthlyFee ? enrollment.monthlyFee.toFixed(2) : '380,00');
  text = text.replace(/{{VALOR_EXTENSO}}/g, enrollment?.monthlyFee ? `${enrollment.monthlyFee.toFixed(2)} reais` : 'trezentos e oitenta reais');
  text = text.replace(/{{DIA_VENCIMENTO}}/g, String(enrollment?.dueDay || 10));

  // Consents & Questions (Sim / Não)
  const termoImagem = student.consentImageUse
    ? '[ X ] SIM    [   ] NÃO\nO(A) CONTRATANTE AUTORIZA expressamente a utilização de sua imagem, voz e registros fotográficos em postagens de cunho institucional e informativo nas redes sociais e mídias do Studio Ana Paula Rodrigues.'
    : '[   ] SIM    [ X ] NÃO\nO(A) CONTRATANTE NÃO AUTORIZA a utilização ou veiculação de sua imagem e voz em redes sociais ou meios de comunicação.';

  const termoAtestado = student.consentMedicalCertificate
    ? '[ X ] SIM    [   ] NÃO\nO(A) CONTRATANTE declara-se CIENTE e plenamente de acordo com a obrigatoriedade da apresentação anual de ATESTADO MÉDICO DE APTIDÃO FÍSICA para a prática de Pilates e Fisioterapia, comprometendo-se a renová-lo a cada 12 (doze) meses.'
    : '[   ] SIM    [ X ] NÃO\nO(A) CONTRATANTE NÃO confirma ciência da apresentação anual do atestado de aptidão física.';

  text = text.replace(/{{TERMO_USO_IMAGEM}}/g, termoImagem);
  text = text.replace(/{{TERMO_ATESTADO_MEDICO}}/g, termoAtestado);

  text = text.replace(/{{DATA_ATUAL}}/g, todayFormatted);

  return text;
}

export const ContratoModal: React.FC<ContratoModalProps> = ({
  student,
  companyData,
  onClose,
  onSaveSignature,
}) => {
  const [copied, setCopied] = useState(false);
  const [signature, setSignature] = useState<string | null>(student.signature || null);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const contractText = generateContractText(student, companyData);

  const handleCopy = () => {
    navigator.clipboard.writeText(contractText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSignature = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL();
      setSignature(dataURL);
      if (onSaveSignature) {
        onSaveSignature(dataURL);
      }
    }
  };

  const handleClearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setSignature(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-3xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-900">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Emissão de Contrato - {student.name}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Gerado automaticamente com os dados da empresa e a matrícula do aluno
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contract Preview Document Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 rounded-xl border border-zinc-200 shadow-inner font-mono text-[11px] text-zinc-800 whitespace-pre-wrap leading-relaxed select-text print:bg-white print:p-0 print:border-none">
          {contractText}
          
          {signature && (
            <div className="mt-8 pt-4 border-t border-zinc-400 inline-block">
              <img src={signature} alt="Assinatura do Aluno" className="h-20 w-auto" />
              <p className="text-[10px] text-zinc-600 mt-1">Assinado digitalmente em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          )}
        </div>

        {/* Signature Area */}
        <div className="pt-4 border-t border-zinc-100">
          <h4 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-teal-600" />
            Assinatura do Aluno (Mobile/Mouse)
          </h4>
          
          {!signature ? (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 overflow-hidden">
                <SignatureCanvas 
                  ref={sigCanvas}
                  penColor='black'
                  canvasProps={{width: 500, height: 150, className: 'sigCanvas'}} 
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleClearSignature} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Limpar
                </button>
                <button onClick={handleSaveSignature} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Salvar Assinatura
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Check className="w-5 h-5 text-emerald-600" />
              <div className="flex-1">
                <p className="text-emerald-900 font-semibold text-xs">Assinatura salva com sucesso!</p>
              </div>
              <button onClick={() => setSignature(null)} className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                Alterar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-[11px]">
          <span>Modelo de Contrato padrão emitido pelo Studio Ana Paula Rodrigues.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg font-medium"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
