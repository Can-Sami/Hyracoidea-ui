# Test Lab Audio Input MP3 Support Design

## Problem
The current `TestLabPage` audio input only accepts WAV files, while backend inference already supports MP3. This creates unnecessary frontend rejection and mismatch with backend capabilities.

## Scope
- Update `src/features/test-lab/TestLabPage.tsx` audio upload flow to accept WAV and MP3.
- Keep existing endpoint, payload fields, and 5MB size cap.
- Update user-facing text and input accept filters to reflect WAV/MP3 support.
- Update `src/features/test-lab/TestLabPage.test.tsx` coverage to verify MP3 acceptance and unsupported file rejection.

## Architecture and Components
- **UI surface:** File input and upload button labels in `TestLabPage`.
- **Validation path:** `onAudioFileChange` local validation logic for extension + MIME type.
- **Request path:** Existing `FormData` submission through `useAudioInferenceMutation` remains unchanged.
- **Test surface:** Behavioral tests around upload acceptance/rejection and request triggering.

## Data Flow
1. User selects a file from the hidden audio input.
2. Frontend validates by extension (`.wav`, `.mp3`) or known MIME type (`audio/wav`, `audio/wave`, `audio/x-wav`, `audio/mpeg`, `audio/mp3`).
3. If valid and within size limit, frontend sends existing `FormData` payload to `/api/v1/inference/intent`.
4. UI renders success/error states as it does today.

## Error Handling
- Unsupported formats show: `Only WAV or MP3 files are supported.`
- Oversized files keep existing message: `Audio file is too large. Maximum size is 5MB.`
- API failures keep existing mutation error handling.

## Testing
- Replace WAV-only rejection test so MP3 is accepted and request is sent.
- Add/adjust unsupported format test using a non-audio file (e.g., `.txt`) to ensure rejection still works.
- Keep existing successful WAV scenario to confirm no regression.

## Notes
- This design intentionally mirrors the already-implemented WAV/MP3 behavior in `TestLabPageRedesign` for consistency.
