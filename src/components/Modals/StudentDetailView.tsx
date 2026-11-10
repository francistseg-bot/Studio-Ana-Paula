import React from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  BookmarkCheck,
  Briefcase,
  Activity,
  MapPin,
  Mail,
  FileCheck,
  UserX,
  UserCheck
} from 'lucide-react';
import { Student } from '../../types/studio';

interface StudentDetailViewProps {
  student: Student;
  onClose: () => void;
  onTogglePaymentStatus: (studentId: string) => void;
  onToggleStudentStatus?: (studentId: string) => void;
  onEmitContract?: (student: Student) => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  onClose,
  onTogglePaymentStatus,
  onToggleStudentStatus,
  onEmitContract,
}) => {
  const isOverdue = student.enrollment?.paymentStatus === 'atrasado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/40 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center font-bold text-base shrink-0">
                {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-zinc-900">
                  {student.name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  student.status === 'ativo' ? 'bg-teal-50 text-teal-800 border border-teal-200/60' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                }`}>
                  {student.status === 'ativo' ? '● Aluno Ativo' : '○ Aluno Inativo'}
                </span>

                {/* BOTÃO INATIVAR / REATIVAR NO HEADER */}
                {onToggleStudentStatus && (
                  <button
                    onClick={() => onToggleStudentStatus(student.id)}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border transition-all shadow-2xs ${
                      student.status === 'ativo'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300'
                    }`}
                    title={
                      student.status === 'ativo'
                        ? 'Inativar aluno caso pare de fazer as aulas'
                        : 'Reativar aluno na plataforma'
                    }
                  >
                    {student.status === 'ativo' ? (
                      <>
                        <UserX className="w-3.5 h-3.5 text-amber-700" />
                        <span>Inativar Aluno</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                        <span>Reativar Aluno</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                CPF: {student.cpf || 'Não cadastrado'} · Nasc: {student.birthDate}
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

        {/* Contact, Email and Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Telefone / WhatsApp
            </span>
            <div className="font-mono text-zinc-800 font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>{student.phone}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              E-mail
            </span>
            <div className="text-zinc-800 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              <span className="truncate">{student.email || 'Não informado'}</span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Endereço Residencial
            </span>
            <div className="text-zinc-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>{student.address || 'Endereço não cadastrado'}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Profissão
            </span>
            <div className="text-zinc-800 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
              <span>{student.profession || 'Não informada'}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Contato de Emergência
            </span>
            <div className="text-zinc-700 flex items-center justify-between">
              <span>{student.emergencyContact || 'Não informado'}</span>
              <span className="font-mono text-zinc-500">{student.emergencyPhone}</span>
            </div>
          </div>
        </div>

        {/* Observations / Queixas Clínicas */}
        <div className="p-3.5 rounded-xl border border-zinc-200 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-900 font-bold">
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>Observações Clínicas & Histórico:</span>
          </div>
          <p className="text-zinc-700 leading-relaxed pt-1">
            {student.observations || 'Nenhuma observação clínica registrada.'}
          </p>
        </div>

        {/* Termos de Consentimento Contratuais (Sim / Não) */}
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Consentimentos & Obrigações Contratuais
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-lg border flex items-start gap-2 ${
              student.consentImageUse 
                ? 'bg-teal-50/70 border-teal-200 text-teal-900' 
                : 'bg-zinc-100 border-zinc-200 text-zinc-700'
            }`}>
              {student.consentImageUse ? (
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">Uso de Imagem nas Redes:</span>
                <span className="text-[11px]">
                  {student.consentImageUse ? 'SIM — Autorizado expressamente' : 'NÃO — Imagem não autorizada'}
                </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-lg border flex items-start gap-2 ${
              student.consentMedicalCertificate 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {student.consentMedicalCertificate ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">Atestado Médico Anual:</span>
                <span className="text-[11px]">
                  {student.consentMedicalCertificate ? 'SIM — Ciente da apresentação anual' : 'NÃO — Pendente de comprovação'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        {student.enrollment ? (
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/60 space-y-2.5">
            <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-800 tracking-wider block">
                  Matrícula Vinculada
                </span>
                <h4 className="text-sm font-bold text-zinc-900">
                  {student.enrollment.modalityName}
                </h4>
              </div>

              <div className="text-right">
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isOverdue ? 'Mensalidade Atrasada' : 'Mensalidade Em Dia'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-700">
              <div>
                <span className="text-zinc-500 block">Frequência Semanal:</span>
                <strong>{student.enrollment.daysPerWeek}x na semana</strong> ({student.enrollment.scheduleDays.join(', ')})
              </div>
              <div>
                <span className="text-zinc-500 block">Horário da Aula:</span>
                <strong className="font-mono">{student.enrollment.scheduleTime}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Professor Responsável:</span>
                <strong>{student.enrollment.instructorName}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Valor da Mensalidade:</span>
                <strong className="font-mono font-bold text-teal-900">
                  R$ {student.enrollment.monthlyFee.toFixed(2)} (Venc. todo dia {student.enrollment.dueDay})
                </strong>
                {student.enrollment.paymentStatus === 'em_dia' && student.enrollment.effectivePaidAmount !== undefined && student.enrollment.effectivePaidAmount < student.enrollment.monthlyFee && (
                  <span className="block text-[10px] text-emerald-800 font-semibold mt-0.5">
                    Quitado com desconto: R$ {student.enrollment.effectivePaidAmount.toFixed(2)} (-R$ {(student.enrollment.monthlyFee - student.enrollment.effectivePaidAmount).toFixed(2)})
                  </span>
                )}
              </div>
            </div>

            {/* Toggle Payment Action */}
            <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between">
              <span className="text-[11px] text-zinc-600">
                Status financeiro deste mês:
              </span>
              <button
                onClick={() => onTogglePaymentStatus(student.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  isOverdue
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                }`}
              >
                {isOverdue ? 'Dar Baixa / Marcar Em Dia' : 'Marcar como Atrasado'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center text-zinc-500">
            Este aluno não possui matrícula vinculada no momento.
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {onEmitContract && (
              <button
                onClick={() => onEmitContract(student)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors text-xs shadow-2xs"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Emitir Contrato</span>
              </button>
            )}

            <a
              href={`https://wa.me/55${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Olá ${student.name.split(' ')[0]}! Tudo bem? Aqui é do Studio Ana Paula Rodrigues Pilates e Fisioterapia.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {onToggleStudentStatus && (
              <button
                onClick={() => onToggleStudentStatus(student.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  student.status === 'ativo'
                    ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800'
                    : 'border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800'
                }`}
                title={
                  student.status === 'ativo'
                    ? 'Inativar aluno caso ele pare de fazer as aulas'
                    : 'Reativar aluno na plataforma'
                }
              >
                {student.status === 'ativo' ? (
                  <>
                    <UserX className="w-3.5 h-3.5 text-amber-700" />
                    <span>Inativar Aluno</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                    <span>Reativar Aluno</span>
                  </>
                )}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl font-medium"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
