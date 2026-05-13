import { onCall } from 'firebase-functions/v2/https'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from './firebaseAdmin'
import { ensureTenantForUser } from './ensureTenantCore'

export const ensureTenant = onCall({ region: 'southamerica-east1' }, async (request) => {
  const user = request.auth
  if (!user) {
    throw new Error('Unauthenticated')
  }

  return ensureTenantForUser(
    {
      tenantDoc: (tenantId) => db.collection('tenants').doc(tenantId),
      serverTimestamp: () => FieldValue.serverTimestamp(),
      setCustomUserClaims: (uid, claims) => getAuth().setCustomUserClaims(uid, claims),
    },
    user,
  )
})
