# Broadcast Context

## Domain Vocabulary

- **Tenant**: the account workspace that owns all operational data. Firestore documents store `tenantId`, and authenticated users receive the same value as a custom claim.
- **Connection**: a sending identity managed inside a tenant. Contacts and messages point to one connection.
- **Contact**: a recipient inside a tenant, attached to one connection.
- **Message**: broadcast content sent to one or more contacts through one connection.
- **Scheduled message**: a message with `status: "scheduled"` and a future `scheduledAt`.
- **Soft delete**: records are hidden by setting `deletedAt`; client queries should read only active records.
- **Tenant isolation**: reads and writes are allowed only when the document `tenantId` matches the authenticated token claim.

