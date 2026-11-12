import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { EmpresaView } from './components/Cadastros/EmpresaView';
import { UsuariosView } from './components/Cadastros/UsuariosView';
import { ModalidadesView } from './components/Cadastros/ModalidadesView';
import { AlunosView } from './components/Cadastros/AlunosView';
import { ProfessoresView } from './components/Cadastros/ProfessoresView';
import { DespesasView } from './components/Cadastros/DespesasView';
import { ContrasAPagarView } from './components/Financeiro/ContrasAPagarView';
import { ContasAReceberView } from './components/Financeiro/ContasAReceberView';
import { DREView } from './components/Financeiro/DREView';
import { AgendaView } from './components/Agenda/AgendaView';
import { StudentDetailView } from './components/Modals/StudentDetailView';
import { ContratoModal } from './components/Modals/ContratoModal';
import { LoginView } from './components/Auth/LoginView';
import { LogOut, Cloud } from 'lucide-react';
import { 
  testFirestoreConnection, 
  subscribeToCollection, 
  saveDocument, 
  saveMultipleDocuments,
  deleteDocument 
} from './services/firebase';

import { 
  MainNavigation, 
  Student, 
  Modality, 
  Instructor, 
  UserAccount,
  CompanyData,
  AgendaClassSession,
  StudioOperatingConfig,
  Expense,
  ExpenseCategory,
  MonthlyCommissionClosing
} from './types/studio';

import { 
  INITIAL_STUDENTS, 
  INITIAL_MODALITIES, 
  INITIAL_INSTRUCTORS, 
  INITIAL_USERS,
  INITIAL_COMPANY_DATA,
  INITIAL_AGENDA_SESSIONS,
  INITIAL_OPERATING_CONFIG,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_EXPENSES,
  getStudioData,
  setStudioData
} from './data/studioData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainNavigation>('dashboard');

  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // State with LocalStorage Persistence
  const [companyData, setCompanyData] = useState<CompanyData>(() =>
    getStudioData('companyData', INITIAL_COMPANY_DATA)
  );

  const [students, setStudents] = useState<Student[]>(() =>
    getStudioData('students', INITIAL_STUDENTS)
  );

  const [modalities, setModalities] = useState<Modality[]>(() =>
    getStudioData('modalities', INITIAL_MODALITIES)
  );

  const [instructors, setInstructors] = useState<Instructor[]>(() =>
    getStudioData('instructors', INITIAL_INSTRUCTORS)
  );

  const [users, setUsers] = useState<UserAccount[]>(() => {
    // Garante que a conta do Administrador Master oficial esteja sempre ativa com a senha 'admin'
    const saved = getStudioData('users', INITIAL_USERS);
    const masterAccount = saved?.find(
      (u: UserAccount) => u.email.trim().toLowerCase() === 'admin@studioanapaula.com.br' && (u.password === 'admin' || u.password === 'admin123')
    );
    if (!masterAccount) {
      setStudioData('users', INITIAL_USERS);
      return INITIAL_USERS;
    }
    return saved;
  });

  const [agendaSessions, setAgendaSessions] = useState<AgendaClassSession[]>(() =>
    getStudioData('agendaSessions', INITIAL_AGENDA_SESSIONS)
  );

  const [operatingConfig, setOperatingConfig] = useState<StudioOperatingConfig>(() =>
    getStudioData('operatingConfig', INITIAL_OPERATING_CONFIG)
  );

  const [expenses, setExpenses] = useState<Expense[]>(() =>
    getStudioData('expenses', INITIAL_EXPENSES)
  );
  
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() =>
    getStudioData('expenseCategories', INITIAL_EXPENSE_CATEGORIES)
  );

  const [commissionClosings, setCommissionClosings] = useState<MonthlyCommissionClosing[]>(() =>
    getStudioData('commissionClosings', [])
  );

  // Sessão de Usuário Autenticado (Login Inicial)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
    getStudioData('currentUser', null)
  );

  // Filter passed from dashboard balloon click to AlunosView
  const [alunosFilter, setAlunosFilter] = useState<{
    status?: 'ativo' | 'inativo';
    paymentStatus?: 'em_dia' | 'atrasado';
  } | undefined>(undefined);

  // Student detailed view modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Contract emission modal from StudentDetailView
  const [contractStudent, setContractStudent] = useState<Student | null>(null);

  // Sincronização em tempo real via Firebase Firestore (Multi-dispositivos: Web e Mobile)
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setIsCloudConnected(connected);
    });

    // 1. Usuários compartilhados entre todos os aparelhos
    const unsubUsers = subscribeToCollection<UserAccount>(
      'users',
      (cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) {
          const masterAccount = cloudUsers.find(
            u => u.email.trim().toLowerCase() === 'admin@studioanapaula.com.br'
          );
          if (!masterAccount) {
            const master = INITIAL_USERS[0];
            saveDocument('users', master);
            setUsers([master, ...cloudUsers]);
          } else {
            setUsers(cloudUsers);
          }
        }
      },
      INITIAL_USERS
    );

    // 2. Alunos
    const unsubStudents = subscribeToCollection<Student>(
      'students',
      (cloudStudents) => {
        setStudents(cloudStudents);
      },
      INITIAL_STUDENTS
    );

    // 3. Modalidades
    const unsubModalities = subscribeToCollection<Modality>(
      'modalities',
      (cloudModalities) => {
        setModalities(cloudModalities);
      },
      INITIAL_MODALITIES
    );

    // 4. Professores
    const unsubInstructors = subscribeToCollection<Instructor>(
      'instructors',
      (cloudInstructors) => {
        setInstructors(cloudInstructors);
      },
      INITIAL_INSTRUCTORS
    );

    // 5. Sessões e Horários da Agenda
    const unsubSessions = subscribeToCollection<AgendaClassSession>(
      'agendaSessions',
      (cloudSessions) => {
        setAgendaSessions(cloudSessions);
      },
      INITIAL_AGENDA_SESSIONS
    );

    // 6. Despesas
    const unsubExpenses = subscribeToCollection<Expense>(
      'expenses',
      (cloudExpenses) => {
        setExpenses(cloudExpenses);
      },
      INITIAL_EXPENSES
    );

    // 7. Categorias de Despesas
    const unsubCategories = subscribeToCollection<ExpenseCategory>(
      'expenseCategories',
      (cloudCategories) => {
        setExpenseCategories(cloudCategories);
      },
      INITIAL_EXPENSE_CATEGORIES
    );

    // 8. Fechamentos de Comissões
    const unsubClosings = subscribeToCollection<MonthlyCommissionClosing>(
      'commissionClosings',
      (cloudClosings) => {
        setCommissionClosings(cloudClosings);
      },
      []
    );

    // 9. Configurações gerais (Empresa e Horários de funcionamento)
    const unsubSettings = subscribeToCollection<{ id: string; [key: string]: any }>(
      'settings',
      (cloudSettings) => {
        const company = cloudSettings.find(s => s.id === 'companyData');
        if (company) {
          const { id, ...rest } = company;
          setCompanyData(rest as CompanyData);
        }
        const opConfig = cloudSettings.find(s => s.id === 'operatingConfig');
        if (opConfig) {
          const { id, ...rest } = opConfig;
          setOperatingConfig(rest as StudioOperatingConfig);
        }
      },
      [
        { id: 'companyData', ...INITIAL_COMPANY_DATA },
        { id: 'operatingConfig', ...INITIAL_OPERATING_CONFIG }
      ]
    );

    return () => {
      unsubUsers();
      unsubStudents();
      unsubModalities();
      unsubInstructors();
      unsubSessions();
      unsubExpenses();
      unsubCategories();
      unsubClosings();
      unsubSettings();
    };
  }, []);

  // Persist to local cache for instant cold start
  useEffect(() => {
    setStudioData('companyData', companyData);
  }, [companyData]);

  useEffect(() => {
    setStudioData('students', students);
  }, [students]);

  useEffect(() => {
    setStudioData('modalities', modalities);
  }, [modalities]);

  useEffect(() => {
    setStudioData('instructors', instructors);
  }, [instructors]);

  useEffect(() => {
    setStudioData('users', users);
  }, [users]);

  useEffect(() => {
    setStudioData('agendaSessions', agendaSessions);
  }, [agendaSessions]);

  useEffect(() => {
    setStudioData('operatingConfig', operatingConfig);
  }, [operatingConfig]);

  useEffect(() => {
    setStudioData('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    setStudioData('expenseCategories', expenseCategories);
  }, [expenseCategories]);

  useEffect(() => {
    setStudioData('commissionClosings', commissionClosings);
  }, [commissionClosings]);

  useEffect(() => {
    setStudioData('currentUser', currentUser);
  }, [currentUser]);

  // Auditoria e segurança contínua: se o usuário for excluído ou inativado em 2.2 Usuários, revoga o acesso imediatamente
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const activeAccount = users.find(u => u.id === currentUser.id && u.status === 'Ativo');
      if (!activeAccount) {
        setCurrentUser(null);
      }
    }
  }, [users, currentUser]);

  // Handlers de Autenticação / Sessão
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Handlers para fechamento e reabertura de comissão dos professores
  const handleSaveCommissionClosing = (closing: MonthlyCommissionClosing) => {
    setCommissionClosings(prev => {
      const existingIdx = prev.findIndex(
        c => c.id === closing.id || (c.instructorId === closing.instructorId && c.month === closing.month && c.year === closing.year)
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = closing;
        return updated;
      }
      return [closing, ...prev];
    });
    saveDocument('commissionClosings', closing);
  };

  const handleReopenCommissionClosing = (closingId: string) => {
    setCommissionClosings(prev => prev.filter(c => c.id !== closingId));
    deleteDocument('commissionClosings', closingId);
  };

  // Navigation handler from balloons or menus
  const handleNavigate = (
    tab: MainNavigation,
    filter?: { status?: 'ativo' | 'inativo'; paymentStatus?: 'em_dia' | 'atrasado' }
  ) => {
    setCurrentTab(tab);
    setAlunosFilter(filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync a student's enrollment into agenda sessions (for all active enrolled students)
  const syncStudentToAgenda = (student: Student, currentSessions: AgendaClassSession[]): AgendaClassSession[] => {
    let newSessions = [...currentSessions];

    // First remove this student from any slot that was created automatically via previous enrollment
    newSessions = newSessions.map(sess => ({
      ...sess,
      students: sess.students.filter(sl => sl.studentId !== student.id || sl.notes?.includes('Reposição'))
    }));

    // If student is not active or has no enrollment, return the cleaned sessions
    if (student.status !== 'ativo' || !student.enrollment) {
      return newSessions;
    }

    const { scheduleDays, scheduleTime, instructorId, instructorName, modalityName } = student.enrollment;
    const daysOfWeekMap: Record<string, number> = {
      'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sábado': 6
    };

    const today = new Date();

    // Schedule for the next 4 weeks
    for (let week = 0; week < 4; week++) {
      for (const dayName of scheduleDays) {
        const dayOfWeek = daysOfWeekMap[dayName];
        if (dayOfWeek === undefined) continue;

        const sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() + (week * 7) + (dayOfWeek - today.getDay()));
        const dateIso = sessionDate.toISOString().split('T')[0];

        let session = newSessions.find(
          s => s.date === dateIso && s.time === scheduleTime && s.instructorId === instructorId
        );

        if (!session) {
          session = {
            id: `sess-${dateIso}-${scheduleTime.replace(':', '')}-${instructorId}`,
            date: dateIso,
            time: scheduleTime,
            instructorId,
            instructorName,
            modalityName,
            maxCapacity: operatingConfig.defaultCapacity || 4,
            students: []
          };
          newSessions.push(session);
        }

        if (!session.students.find(sl => sl.studentId === student.id)) {
          session.students.push({
            id: `slot-${student.id}-${dateIso}-${scheduleTime.replace(':', '')}`,
            studentId: student.id,
            studentName: student.name,
            studentPhone: student.phone,
            studentPhoto: student.photoUrl,
            attendanceStatus: 'agendado',
            notes: `Matrícula: ${modalityName} (${dayName}s ${scheduleTime})`
          });
        }
      }
    }

    return newSessions;
  };

  // Student handlers
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    saveDocument('students', newStudent);
    if (newStudent.enrollment) {
      setAgendaSessions((prevSessions) => {
        const updated = syncStudentToAgenda(newStudent, prevSessions);
        saveMultipleDocuments('agendaSessions', updated);
        return updated;
      });
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    saveDocument('students', updatedStudent);
    if (selectedStudent && selectedStudent.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }
    // Sincroniza imediatamente com a agenda
    setAgendaSessions((prevSessions) => {
      const updated = syncStudentToAgenda(updatedStudent, prevSessions);
      saveMultipleDocuments('agendaSessions', updated);
      return updated;
    });
  };

  // Garante que TODOS os alunos cadastrados com matrícula ativa apareçam na agenda
  useEffect(() => {
    let synced = [...agendaSessions];
    students.forEach(st => {
      if (st.status === 'ativo' && st.enrollment) {
        synced = syncStudentToAgenda(st, synced);
      }
    });
    // Apenas atualiza se houve mudança estrutural de alunos
    if (synced.length !== agendaSessions.length || 
        synced.reduce((acc, s) => acc + s.students.length, 0) !== agendaSessions.reduce((acc, s) => acc + s.students.length, 0)) {
      setAgendaSessions(synced);
    }
  }, []);

  const handleTogglePaymentStatus = (studentId: string, paidAmount?: number, paymentDate?: string) => {
    let studentToSave: Student | null = null;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId && s.enrollment) {
          const isCurrentlyPaid = s.enrollment.paymentStatus === 'em_dia';
          let nextStatus: 'em_dia' | 'atrasado' = 'em_dia';
          let finalPaidAmount: number | undefined = undefined;
          let finalPaymentDate: string | undefined = undefined;
          let discount: number | undefined = undefined;

          if (paidAmount !== undefined) {
            // Efetivação explícita de baixa (com ou sem desconto)
            nextStatus = 'em_dia';
            finalPaidAmount = paidAmount;
            finalPaymentDate = paymentDate || new Date().toISOString().split('T')[0];
            discount = Math.max(0, s.enrollment.monthlyFee - paidAmount);
          } else {
            // Alternância manual simples de status
            nextStatus = isCurrentlyPaid ? 'atrasado' : 'em_dia';
            if (nextStatus === 'em_dia') {
              finalPaidAmount = s.enrollment.effectivePaidAmount ?? s.enrollment.monthlyFee;
              finalPaymentDate = s.enrollment.paymentDate || new Date().toISOString().split('T')[0];
              discount = Math.max(0, s.enrollment.monthlyFee - finalPaidAmount);
            } else {
              // Estornado para em atraso
              finalPaidAmount = undefined;
              finalPaymentDate = undefined;
              discount = undefined;
            }
          }

          const updated: Student = {
            ...s,
            enrollment: {
              ...s.enrollment,
              paymentStatus: nextStatus,
              effectivePaidAmount: finalPaidAmount,
              paymentDate: finalPaymentDate,
              discountAmount: discount,
            },
          };
          studentToSave = updated;
          return updated;
        }
        return s;
      })
    );

    if (studentToSave) {
      saveDocument('students', studentToSave);
    }

    if (selectedStudent && selectedStudent.id === studentId && selectedStudent.enrollment) {
      const isCurrentlyPaid = selectedStudent.enrollment.paymentStatus === 'em_dia';
      let nextStatus: 'em_dia' | 'atrasado' = 'em_dia';
      let finalPaidAmount: number | undefined = undefined;
      let finalPaymentDate: string | undefined = undefined;
      let discount: number | undefined = undefined;

      if (paidAmount !== undefined) {
        nextStatus = 'em_dia';
        finalPaidAmount = paidAmount;
        finalPaymentDate = paymentDate || new Date().toISOString().split('T')[0];
        discount = Math.max(0, selectedStudent.enrollment.monthlyFee - paidAmount);
      } else {
        nextStatus = isCurrentlyPaid ? 'atrasado' : 'em_dia';
        if (nextStatus === 'em_dia') {
          finalPaidAmount = selectedStudent.enrollment.effectivePaidAmount ?? selectedStudent.enrollment.monthlyFee;
          finalPaymentDate = selectedStudent.enrollment.paymentDate || new Date().toISOString().split('T')[0];
          discount = Math.max(0, selectedStudent.enrollment.monthlyFee - finalPaidAmount);
        }
      }

      setSelectedStudent({
        ...selectedStudent,
        enrollment: {
          ...selectedStudent.enrollment,
          paymentStatus: nextStatus,
          effectivePaidAmount: finalPaidAmount,
          paymentDate: finalPaymentDate,
          discountAmount: discount,
        },
      });
    }
  };

  const handleToggleStudentStatus = (studentId: string) => {
    let studentToSave: Student | null = null;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const nextStatus = s.status === 'ativo' ? 'inativo' : 'ativo';
          const updated: Student = {
            ...s,
            status: nextStatus,
          };
          studentToSave = updated;
          return updated;
        }
        return s;
      })
    );

    if (studentToSave) {
      saveDocument('students', studentToSave);
    }

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === 'ativo' ? 'inativo' : 'ativo',
            }
          : null
      );
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!confirm('Tem certeza que deseja excluir permanentemente o cadastro deste aluno e todas as suas presenças agendadas?')) return;
    
    setStudents((prev) => prev.filter(s => s.id !== studentId));
    deleteDocument('students', studentId);

    setAgendaSessions((prev) => {
      const updated = prev.map(s => ({
        ...s,
        students: s.students.filter(slot => slot.studentId !== studentId)
      })).filter(s => s.students.length > 0);
      saveMultipleDocuments('agendaSessions', updated);
      return updated;
    });

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent(null);
    }
  };

  const handleSaveStudentSignature = (studentId: string, signature: string) => {
    let studentToSave: Student | null = null;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated = { ...s, signature };
          studentToSave = updated;
          return updated;
        }
        return s;
      })
    );
    if (studentToSave) {
      saveDocument('students', studentToSave);
    }
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, signature });
    }
    if (contractStudent && contractStudent.id === studentId) {
      setContractStudent({ ...contractStudent, signature });
    }
  };

  // Modality handlers
  const handleAddModality = (newMod: Modality) => {
    setModalities((prev) => [...prev, newMod]);
    saveDocument('modalities', newMod);
  };

  const handleUpdateModality = (updatedMod: Modality) => {
    setModalities((prev) =>
      prev.map((m) => (m.id === updatedMod.id ? updatedMod : m))
    );
    saveDocument('modalities', updatedMod);
  };

  const handleDeleteModality = (modId: string) => {
    setModalities((prev) => prev.filter((m) => m.id !== modId));
    deleteDocument('modalities', modId);
  };

  const handleApplyAdjustment = (type: 'percent' | 'fixed', value: number) => {
    const adjusted = modalities.map((m) => {
      if (m.billingType === 'reposicao') return m;
      let newPrice = m.price;
      if (type === 'percent') {
        newPrice = Math.round((m.price * (1 + value / 100)) * 100) / 100;
      } else {
        newPrice = Math.max(0, Math.round((m.price + value) * 100) / 100);
      }
      return {
        ...m,
        price: newPrice
      };
    });
    setModalities(adjusted);
    saveMultipleDocuments('modalities', adjusted);
    alert(`Reajuste de ${type === 'percent' ? `${value}%` : `R$ ${value.toFixed(2)}`} aplicado com sucesso em todas as modalidades!`);
  };

  const handleToggleModalityStatus = (modId: string) => {
    setModalities((prev) =>
      prev.map((m) => {
        if (m.id === modId) {
          const updated = { ...m, active: !m.active };
          saveDocument('modalities', updated);
          return updated;
        }
        return m;
      })
    );
  };

  // Instructor handlers
  const handleAddInstructor = (newInst: Instructor) => {
    setInstructors((prev) => [...prev, newInst]);
    saveDocument('instructors', newInst);
  };

  const handleUpdateInstructor = (updatedInst: Instructor) => {
    setInstructors((prev) =>
      prev.map((i) => (i.id === updatedInst.id ? updatedInst : i))
    );
    saveDocument('instructors', updatedInst);
  };

  const handleDeleteInstructor = (instId: string) => {
    setInstructors((prev) => prev.filter((i) => i.id !== instId));
    deleteDocument('instructors', instId);
  };

  const handleToggleInstructorStatus = (instId: string) => {
    setInstructors((prev) =>
      prev.map((i) => {
        if (i.id === instId) {
          const updated: Instructor = { ...i, status: (i.status === 'Ativo' ? 'Inativo' : 'Ativo') as 'Ativo' | 'Inativo' };
          saveDocument('instructors', updated);
          return updated;
        }
        return i;
      })
    );
  };

  // User handlers
  const handleAddUser = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser]);
    saveDocument('users', newUser);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    saveDocument('users', updatedUser);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    deleteDocument('users', userId);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: UserAccount = { ...u, status: (u.status === 'Ativo' ? 'Inativo' : 'Ativo') as 'Ativo' | 'Inativo' };
          saveDocument('users', updated);
          return updated;
        }
        return u;
      })
    );
  };

  const activeStudentsCount = students.filter((s) => s.status === 'ativo').length;
  const inactiveStudentsCount = students.filter((s) => s.status === 'inativo').length;

  // Tela Inicial de Login / Bloqueio de Acesso
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        onLogin={handleLogin}
        companyData={companyData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans antialiased selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        activeStudentsCount={activeStudentsCount}
        inactiveStudentsCount={inactiveStudentsCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport (offset by 288px on lg screens for left sidebar) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        
        {/* Top Breadcrumb & Status Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs truncate">
            <span className="font-semibold text-zinc-900 truncate">
              Studio Ana Paula Rodrigues
            </span>
            <span className="text-zinc-400">/</span>
            <span className="text-teal-700 font-semibold capitalize truncate">
              {currentTab === 'dashboard' && '1. Visão Geral (Dashboard)'}
              {currentTab === 'cadastros-empresa' && '2. Cadastros / 2.1 Empresa & Contrato'}
              {currentTab === 'cadastros-usuarios' && '2. Cadastros / 2.2 Usuários'}
              {currentTab === 'cadastros-modalidades' && '2. Cadastros / 2.3 Modalidades'}
              {currentTab === 'cadastros-alunos' && '2. Cadastros / 2.4 Alunos & Matrícula'}
              {currentTab === 'cadastros-professores' && '2. Cadastros / 2.5 Professores & Comissões'}
              {currentTab === 'cadastros-despesas' && '2. Cadastros / 2.6 Categorias de Despesas'}
              {currentTab === 'agenda' && '3. Agenda / Agendamentos & Presenças'}
              {currentTab === 'financeiro-pagar' && '4. Financeiro / 4.1 Contas a Pagar'}
              {currentTab === 'financeiro-receber' && '4. Financeiro / 4.2 Contas a Receber'}
              {currentTab === 'financeiro-dre' && '4. Financeiro / 4.3 DRE & Demonstrativo'}
            </span>
          </div>

          {/* User Profile Bar & Cloud Status & Logout */}
          <div className="flex items-center gap-2.5 text-xs shrink-0">
            {/* Indicador de Sincronização em Nuvem (Multi-dispositivos Web e Mobile) */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                isCloudConnected 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90' 
                  : 'bg-zinc-50 text-zinc-600 border-zinc-200'
              }`}
              title="Sincronização em tempo real na nuvem (Firestore) ativa para acesso simultâneo em computadores e celulares"
            >
              <Cloud className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-emerald-600' : 'text-zinc-400'}`} />
              <span className="font-medium text-[11px]">
                {isCloudConnected ? 'Nuvem Conectada' : 'Conectando à Nuvem...'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200/80">
              <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                {currentUser?.name ? currentUser.name[0] : 'U'}
              </div>
              <span className="font-semibold text-zinc-800 truncate max-w-[140px]">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-teal-700 font-medium">
                ({currentUser?.role})
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Sair do sistema e voltar para tela de login"
              className="px-2.5 py-1.5 rounded-lg bg-zinc-50 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 border border-zinc-200 hover:border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="font-medium hidden md:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex-1">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              students={students}
              onNavigate={handleNavigate}
              onSelectStudentDetail={(student) => setSelectedStudent(student)}
            />
          )}

          {currentTab === 'cadastros-empresa' && (
            <EmpresaView
              companyData={companyData}
              onSaveCompanyData={(data) => {
                setCompanyData(data);
                saveDocument('settings', { id: 'companyData', ...data });
              }}
            />
          )}

          {currentTab === 'cadastros-usuarios' && (
            <UsuariosView
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {currentTab === 'cadastros-modalidades' && (
            <ModalidadesView
              modalities={modalities}
              onAddModality={handleAddModality}
              onUpdateModality={handleUpdateModality}
              onDeleteModality={handleDeleteModality}
              onApplyAdjustment={handleApplyAdjustment}
              onToggleStatus={handleToggleModalityStatus}
            />
          )}

          {currentTab === 'cadastros-alunos' && (
            <AlunosView
              students={students}
              modalities={modalities}
              instructors={instructors}
              companyData={companyData}
              initialFilter={alunosFilter}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onToggleStudentStatus={handleToggleStudentStatus}
              onSelectStudentDetail={(student) => setSelectedStudent(student)}
            />
          )}

          {currentTab === 'cadastros-professores' && (
            <ProfessoresView
              instructors={instructors}
              students={students}
              agendaSessions={agendaSessions}
              modalities={modalities}
              commissionClosings={commissionClosings}
              onSaveCommissionClosing={handleSaveCommissionClosing}
              onReopenCommissionClosing={handleReopenCommissionClosing}
              onAddInstructor={handleAddInstructor}
              onUpdateInstructor={handleUpdateInstructor}
              onDeleteInstructor={handleDeleteInstructor}
              onToggleStatus={handleToggleInstructorStatus}
            />
          )}

          {currentTab === 'cadastros-despesas' && (
            <DespesasView
              categories={expenseCategories}
              onAddCategory={(cat) => {
                setExpenseCategories(prev => [...prev, cat]);
                saveDocument('expenseCategories', cat);
              }}
              onDeleteCategory={(id) => {
                setExpenseCategories(prev => prev.filter(c => c.id !== id));
                deleteDocument('expenseCategories', id);
              }}
            />
          )}

          {currentTab === 'agenda' && (
            <AgendaView
              sessions={agendaSessions}
              instructors={instructors}
              students={students}
              modalities={modalities}
              operatingConfig={operatingConfig}
              onUpdateSessions={(updated) => {
                setAgendaSessions(updated);
                saveMultipleDocuments('agendaSessions', updated);
              }}
              onUpdateOperatingConfig={(cfg) => {
                setOperatingConfig(cfg);
                saveDocument('settings', { id: 'operatingConfig', ...cfg });
              }}
              onSelectStudentDetail={(student) => setSelectedStudent(student)}
            />
          )}

          {currentTab === 'financeiro-pagar' && (
            <ContrasAPagarView
              expenses={expenses}
              categories={expenseCategories}
              onAddExpense={(exp) => {
                setExpenses(prev => [exp, ...prev]);
                saveDocument('expenses', exp);
              }}
              onTogglePaid={(id, effectiveDate) => {
                setExpenses(prev => prev.map(e => {
                  if (e.id === id) {
                    const willBePaid = !e.isPaid;
                    const updated = {
                      ...e,
                      isPaid: willBePaid,
                      paymentDate: willBePaid ? (effectiveDate || new Date().toISOString().split('T')[0]) : undefined
                    };
                    saveDocument('expenses', updated);
                    return updated;
                  }
                  return e;
                }));
              }}
              onDeleteExpense={(id) => {
                setExpenses(prev => prev.filter(e => e.id !== id));
                deleteDocument('expenses', id);
              }}
            />
          )}

          {currentTab === 'financeiro-receber' && (
            <ContasAReceberView
              students={students}
              instructors={instructors}
              onTogglePaid={(studentId, paidAmount, paymentDate) => handleTogglePaymentStatus(studentId, paidAmount, paymentDate)}
              onUpdateFee={(studentId, newFee, dueDay) => {
                setStudents(prev => prev.map(s => {
                  if (s.id === studentId && s.enrollment) {
                    const updated = {
                      ...s,
                      enrollment: {
                        ...s.enrollment,
                        monthlyFee: newFee,
                        dueDay: dueDay
                      }
                    };
                    saveDocument('students', updated);
                    return updated;
                  }
                  return s;
                }));
              }}
              onDeleteEnrollment={(studentId) => {
                setStudents(prev => prev.map(s => {
                  if (s.id === studentId) {
                    const { enrollment, ...rest } = s;
                    const updated = { ...rest };
                    saveDocument('students', updated);
                    return updated;
                  }
                  return s;
                }));
              }}
            />
          )}

          {currentTab === 'financeiro-dre' && (
            <DREView
              students={students}
              expenses={expenses}
              instructors={instructors}
              agendaSessions={agendaSessions}
              modalities={modalities}
              commissionClosings={commissionClosings}
              onSaveCommissionClosing={handleSaveCommissionClosing}
              onReopenCommissionClosing={handleReopenCommissionClosing}
              onNavigateTab={(tab) => handleNavigate(tab)}
            />
          )}
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-zinc-200 bg-white py-5 px-6 sm:px-8 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/assets/aistudio/46419_453e5190b728e5f80b8f1cbecbd7b75d-19_02_2026__16_16_41_d3f20382.jpg"
              alt="Logo"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="font-semibold text-zinc-800">
              Studio Ana Paula Rodrigues
            </span>
            <span>·</span>
            <span>Pilates e Fisioterapia</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            {companyData.address} · Tel: {companyData.phone}
          </p>
        </footer>

      </div>

      {/* Student Detailed Sheet Modal */}
      {selectedStudent && (
        <StudentDetailView
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onTogglePaymentStatus={handleTogglePaymentStatus}
          onToggleStudentStatus={handleToggleStudentStatus}
          onEmitContract={(student) => {
            setSelectedStudent(null);
            setContractStudent(student);
          }}
        />
      )}

      {/* Contract Modal triggered from StudentDetailView */}
      {contractStudent && (
        <ContratoModal
          student={contractStudent}
          companyData={companyData}
          onClose={() => setContractStudent(null)}
          onSaveSignature={(sig) => handleSaveStudentSignature(contractStudent.id, sig)}
        />
      )}

    </div>
  );
}
