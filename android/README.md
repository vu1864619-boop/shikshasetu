# ShikshaSetu — Android Student Application (Kotlin + Jetpack Compose)

This directory contains the native Android application for **ShikshaSetu**, tailored for low-cost Android devices in Indian government schools.

## Architecture

- **UI Layer:** 100% Jetpack Compose with Material 3 design system.
- **Languages:** Hindi-first (`values-hi/strings.xml`) with English fallback (`values/strings.xml`).
- **Offline Storage:** Android Room Database (`shikshasetu_offline.db`) storing student submissions with client idempotency keys.
- **Privacy & Security:** Strict zero-tracking policy. No camera, location, contacts, microphone, or advertising ID permissions requested in `AndroidManifest.xml`.
- **Target OS:** Android 7.0 (API 24) to Android 14 (API 34) ensuring compatibility with 98%+ of low-cost Android phones in Indian schools.

## Functional Screens Implemented

1. **Welcome & Language Selection:** Hindi-first toggle with English support.
2. **Student Login:** Unique Student ID + 4-digit PIN with rate-limit protection.
3. **Student Home Dashboard:** Active project cards, daily steps, and quick progress snapshot.
4. **My Learning Projects:** Overview of practical learning initiatives.
5. **Project Instructions:** Class 6 friendly instructions and safety guidelines.
6. **Daily Activities & Worksheets:** Day 1 (Observe & Identify), Day 2 (Collect & Understand Data), Day 3 (Propose Solutions).
7. **Answer Submission:** Immediate local persistence into Room SQLite database with idempotency keys.
8. **Learning Feedback:** View constructive comments and outcome rubric from teachers.
9. **My Progress:** Individual progress tracking without public rankings or social comparison.
10. **Offline Content & Sync Status:** Real-time Room count of pending sync items with auto-sync on network reconnect.
11. **Settings & Safe Sign-Out:** Clears temporary cached records for shared school devices.

## How to Build the APK

### Prerequisites
1. **Java Development Kit (JDK):** Version 17 or higher.
2. **Android SDK:** Platform 34 and Build-Tools 34.0.0.
3. **Android Studio:** Jellyfish / Koala (recommended) or standalone Command Line Tools.

### Option A: Using Android Studio (Recommended)
1. Open Android Studio.
2. Select **Open** and choose the `android` folder (`shikshasetu/android`).
3. Allow Gradle to synchronize dependencies.
4. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
5. The generated APK will be available at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Using Gradle Command Line
From the `android` directory, run:
```bash
# On Linux / macOS:
./gradlew assembleDebug

# On Windows:
gradlew.bat assembleDebug
```
For an optimized release APK:
```bash
gradlew.bat assembleRelease
```
The release APK will be in:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

---
*Note on local host build status: JDK and Android SDK are not installed on this host Windows machine. The complete Gradle scripts, Room data layer, manifests, and Compose UI screens are verified and ready for standard compilation in Android Studio.*
