# ShikshaSetu — Offline-First Synchronization Engine Specification

## 1. Core Principles

In resource-constrained Indian government schools, cellular and broadband internet access is intermittent. The ShikshaSetu platform is designed with an **Offline-First Paradigm**:
1. All core project instructions, activity worksheets, and printable resources are cached locally.
2. Students can complete activities, tally data, and submit worksheets without an active internet connection.
3. Every offline submission is stored locally in IndexedDB (Web/PWA) or Room (Android) before any network attempt.
4. An action is **never marked as synchronized** until the server explicitly returns a confirmed receipt.

## 2. Sync Queue Data Structure

Each queued item contains:
- `client_idempotency_key`: Client-generated UUID (e.g. `offline-sub-4e58b1...`).
- `project_id`: Project identifier (e.g. `proj-water-01`).
- `activity_id`: Activity identifier (e.g. `act-water-d1`).
- `day_number`: Project day (1, 2, or 3).
- `answers`: JSON object of student answers.
- `client_timestamp`: ISO 8601 creation timestamp.
- `sync_status`: `pending` or `synced`.

## 3. Server Batch Sync Endpoint (`POST /api/sync/batch`)

The client sends a batch payload:
```json
{
  "client_device_id": "tablet-gups-042",
  "items": [
    {
      "client_idempotency_key": "offline-sub-4e58b1...",
      "type": "submission",
      "client_timestamp": "2026-10-19T04:15:00Z",
      "data": { ... }
    }
  ]
}
```

### Server Processing Rules:
1. **Idempotency Verification:** If a submission with the same `client_idempotency_key` is already present, the server acknowledges it with status `duplicate_acknowledged` and does not insert duplicate rows.
2. **Conflict Resolution:** If a submission for the same student, project, and day already exists from another device:
   - If the incoming client timestamp is newer, the server updates the submission and returns `conflict_resolved` (client merge).
   - If the server record is newer, the server preserves its record and notifies the client.
3. **Receipt Confirmation:** The server returns an array of confirmed item keys with server timestamps.

## 4. UI Indicators
- **Green Badge:** All records synchronized.
- **Yellow Warning Badge:** Unsynced records waiting in local queue with count (e.g. `2 लंबित सिंक`).
- **Manual Trigger:** "Sync Now" button allows immediate synchronization when connectivity resumes.
