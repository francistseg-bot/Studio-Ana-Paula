import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Inicializa a aplicação Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicializa o Firestore com o Database ID provisionado
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Validação de conexão conforme exigido pelas diretrizes do Firebase
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Firestore conectado com sucesso.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] O cliente Firestore está offline ou conectando...');
    }
    return false;
  }
}

// Ouvinte em tempo real para sincronização automática entre múltiplos dispositivos
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  initialDataIfEmpty?: T[]
): () => void {
  const colRef = collection(db, collectionName);

  const unsubscribe = onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty && initialDataIfEmpty && initialDataIfEmpty.length > 0) {
        // Popula os dados iniciais na nuvem se a coleção estiver vazia
        try {
          for (const item of initialDataIfEmpty) {
            const clean = sanitizeForFirestore(item);
            await setDoc(doc(db, collectionName, item.id), clean);
          }
        } catch (e) {
          console.error(`[Firebase] Erro ao inicializar ${collectionName}:`, e);
        }
        return;
      }

      const items: T[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as T);
      });
      onUpdate(items);
    },
    (err) => {
      console.error(`[Firebase] Erro no listener da coleção ${collectionName}:`, err);
    }
  );

  return unsubscribe;
}

// Remove undefined keys recursively to prevent Firestore 'Unsupported field value: undefined' errors
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as unknown as T;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as unknown as T;
  }
  if (typeof obj === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return obj;
}

// Salva ou atualiza um documento no Firestore (sincroniza instantaneamente para outros aparelhos)
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  try {
    const cleanItem = sanitizeForFirestore(item);
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, cleanItem, { merge: true });
  } catch (err) {
    console.error(`[Firebase] Erro ao salvar em ${collectionName}/${item.id}:`, err);
    throw err;
  }
}

// Salva múltiplos documentos no Firestore
export async function saveMultipleDocuments<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  try {
    for (const item of items) {
      const cleanItem = sanitizeForFirestore(item);
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, cleanItem, { merge: true });
    }
  } catch (err) {
    console.error(`[Firebase] Erro ao salvar lote em ${collectionName}:`, err);
    throw err;
  }
}

// Remove um documento do Firestore (sincroniza remoção para outros aparelhos)
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`[Firebase] Erro ao remover de ${collectionName}/${id}:`, err);
    throw err;
  }
}
