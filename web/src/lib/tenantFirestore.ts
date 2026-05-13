import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { convertTimestamps } from './utils'

type TenantDocument = {
  id: string
  tenantId: string
  deletedAt: Date | null
  createdAt: Date
}

type CollectionName = 'connections' | 'contacts' | 'messages'

export function tenantCollectionRef(collectionName: CollectionName) {
  return collection(db, collectionName)
}

export function activeTenantQuery(collectionName: CollectionName, tenantId: string, extra: QueryConstraint[] = []) {
  return query(
    tenantCollectionRef(collectionName),
    where('tenantId', '==', tenantId),
    where('deletedAt', '==', null),
    ...extra,
    orderBy('createdAt', 'desc'),
  )
}

export async function listActiveTenantDocs<T extends TenantDocument>(
  collectionName: CollectionName,
  tenantId: string,
  extra: QueryConstraint[] = [],
) {
  const snap = await getDocs(activeTenantQuery(collectionName, tenantId, extra))
  return snap.docs.map((item) => documentToModel<T>(item.id, item.data()))
}

export async function createTenantDoc<TInput extends object>(
  collectionName: CollectionName,
  tenantId: string,
  input: TInput,
) {
  await addDoc(tenantCollectionRef(collectionName), {
    ...input,
    tenantId,
    deletedAt: null,
    createdAt: Timestamp.now(),
  })
}

export async function updateTenantDoc<TInput extends object>(
  collectionName: CollectionName,
  id: string,
  input: TInput,
) {
  await updateDoc(doc(db, collectionName, id), { ...input })
}

export async function softDeleteTenantDoc(collectionName: CollectionName, id: string) {
  await updateDoc(doc(db, collectionName, id), { deletedAt: Timestamp.now() })
}

function documentToModel<T>(id: string, data: DocumentData) {
  const converted = convertTimestamps<Omit<T, 'id'>>(data)
  return { id, ...converted } as T
}
