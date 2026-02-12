# Phase 2 Manual QA Checklist

## Setup
- [ ] Migration applied successfully: `supabase db reset`
- [ ] No errors in migration log
- [ ] All tables created (verify with `\dt public.*`)
- [ ] All functions created (verify with `\df yombri.*`)

## 1. Event Creation
- [ ] Create event via `yombri.create_event()`
- [ ] Verify event appears in `public.events`
- [ ] Verify organizer added to `public.event_admins`
- [ ] Verify secrets created in `public.event_secrets`
- [ ] Verify event group created in `public.groups`
- [ ] Verify audit log entry created

## 2. Interest Signals
- [ ] Call `yombri.signal_interest()` with valid coordinates
- [ ] Verify location is snapped to grid (~0.02° precision)
- [ ] Try sending 7 signals in 24h (should fail on 7th)
- [ ] Try sending 2 signals within 10 minutes (should fail on 2nd)
- [ ] Verify signals are NOT directly readable via SELECT

## 3. Check-in: Geo-based
- [ ] Join event (insert into `event_participants`)
- [ ] Call `verify_check_in()` with location inside radius
- [ ] Verify status changes to 'checked_in'
- [ ] Verify `checkin_method` = 'geo'
- [ ] Try check-in outside radius (should fail)
- [ ] Try check-in twice (should be idempotent)

## 4. Check-in: Token-based
- [ ] Mint token with `mint_event_token()`
- [ ] Call `verify_check_in()` with token
- [ ] Verify status changes to 'checked_in'
- [ ] Verify `checkin_method` = 'qr'
- [ ] Try reusing same token (should fail - replay protection)
- [ ] Wait for token expiry, try using (should fail)

## 5. Check-in: TOTP
- [ ] Get TOTP secret from `event_secrets`
- [ ] Generate code with `yombri.totp_code()`
- [ ] Call `verify_check_in_totp()` with code
- [ ] Verify status changes to 'checked_in'
- [ ] Verify `checkin_method` = 'totp'
- [ ] Try invalid code 3 times
- [ ] Verify cooldown is set after 3 failures
- [ ] Try 4th attempt during cooldown (should fail)

## 6. Check-in: Offline Sync
- [ ] Join event
- [ ] Issue offline ticket with `issue_offline_ticket()`
- [ ] Store ticket locally
- [ ] Call `sync_offline_check_in()` with ticket
- [ ] Verify `initially_offline` = true
- [ ] Verify `offline_synced_at` is set
- [ ] Try syncing with expired ticket (should fail)
- [ ] Try syncing with ticket > 8 hours old (should fail)

## 7. Legacy Artifacts
- [ ] Check in to event first
- [ ] Call `append_legacy_artifact()` with payload
- [ ] Verify `sequence_id` starts at 1
- [ ] Verify `previous_hash` is null for first artifact
- [ ] Append second artifact
- [ ] Verify `sequence_id` = 2
- [ ] Verify `previous_hash` matches first artifact's `payload_hash`
- [ ] Verify artifacts NOT directly writable via INSERT

## 8. Event Clustering
- [ ] Create multiple events in same area
- [ ] Call `events_clusters()` with bbox
- [ ] Verify clusters returned with correct buckets
- [ ] Verify sample_event_ids contains up to 5 events
- [ ] Test with different zoom levels (10, 12, 14)
- [ ] Verify grid size adapts to zoom

## 9. Groups & Messages
- [ ] Join event (auto-added to group)
- [ ] Send message via INSERT (should succeed as member)
- [ ] Verify message visible to other members
- [ ] Block another user
- [ ] Verify blocked user's messages hidden
- [ ] Try sending message to group you're not in (should fail)

## 10. RLS Enforcement
- [ ] Set `role = authenticated` and `request.jwt.claims`
- [ ] Try reading `event_secrets` (should return 0 rows)
- [ ] Try reading `interest_signals` (should return 0 rows)
- [ ] Try INSERT into `events` (should fail)
- [ ] Try INSERT into `legacy_artifacts` (should fail)
- [ ] Verify user can only see own profile

## 11. Error Handling
- [ ] Try creating event in the past (should fail)
- [ ] Try signaling interest with invalid lat/lng (should fail)
- [ ] Try checking in to non-existent event (should fail)
- [ ] Try checking in as ejected user (should fail)
- [ ] Verify all errors have helpful hint messages

## Performance Checks
- [ ] Verify all indexes created: `\di public.*`
- [ ] Check query plans for hot queries use indexes
- [ ] Verify RLS policies don't do table scans
- [ ] Run `ANALYZE` and check for missing stats

## Cleanup
- [ ] Run `ROLLBACK` or clean test data
- [ ] Verify no leftover test users in `auth.users`
