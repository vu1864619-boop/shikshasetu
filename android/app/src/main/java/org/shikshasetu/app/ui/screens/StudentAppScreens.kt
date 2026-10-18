package org.shikshasetu.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.shikshasetu.app.data.local.AppDatabase
import org.shikshasetu.app.data.local.entity.SubmissionEntity
import org.shikshasetu.app.ui.theme.*
import java.util.UUID

enum class ScreenState {
    WELCOME_LANGUAGE,
    LOGIN,
    DASHBOARD,
    PROJECTS_LIST,
    PROJECT_INSTRUCTIONS,
    WORKSHEET_ACTIVITY,
    SUBMISSION_CONFIRMATION,
    FEEDBACK_VIEW,
    PROGRESS_VIEW,
    SYNC_STATUS,
    SETTINGS_LOGOUT
}

@Composable
fun StudentAppMain(database: AppDatabase) {
    var currentScreen by remember { mutableStateOf(ScreenState.WELCOME_LANGUAGE) }
    var selectedLanguage by remember { mutableStateOf("hi") } // Default Hindi
    var loggedInStudentId by remember { mutableStateOf("STU-1001") }
    var studentName by remember { mutableStateOf("आरव कुमार") }
    var currentDay by remember { mutableStateOf(1) }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = BackgroundOffWhite
    ) {
        when (currentScreen) {
            // Screen 1: Welcome and language selection
            ScreenState.WELCOME_LANGUAGE -> WelcomeLanguageScreen(
                currentLang = selectedLanguage,
                onLanguageSelected = { lang ->
                    selectedLanguage = lang
                    currentScreen = ScreenState.LOGIN
                }
            )

            // Screen 2: Student ID + PIN login
            ScreenState.LOGIN -> StudentLoginScreen(
                lang = selectedLanguage,
                onLoginSuccess = { id, name ->
                    loggedInStudentId = id
                    studentName = name
                    currentScreen = ScreenState.DASHBOARD
                },
                onBack = { currentScreen = ScreenState.WELCOME_LANGUAGE }
            )

            // Screen 3: Student home dashboard
            ScreenState.DASHBOARD -> StudentDashboardScreen(
                studentName = studentName,
                studentId = loggedInStudentId,
                lang = selectedLanguage,
                onOpenProjects = { currentScreen = ScreenState.PROJECTS_LIST },
                onOpenProgress = { currentScreen = ScreenState.PROGRESS_VIEW },
                onOpenSync = { currentScreen = ScreenState.SYNC_STATUS },
                onOpenSettings = { currentScreen = ScreenState.SETTINGS_LOGOUT }
            )

            // Screen 4: My Learning Projects
            ScreenState.PROJECTS_LIST -> ProjectsListScreen(
                lang = selectedLanguage,
                onSelectProject = {
                    currentScreen = ScreenState.PROJECT_INSTRUCTIONS
                },
                onBack = { currentScreen = ScreenState.DASHBOARD }
            )

            // Screen 5: Project Instructions
            ScreenState.PROJECT_INSTRUCTIONS -> ProjectInstructionsScreen(
                lang = selectedLanguage,
                onStartDay = { day ->
                    currentDay = day
                    currentScreen = ScreenState.WORKSHEET_ACTIVITY
                },
                onBack = { currentScreen = ScreenState.PROJECTS_LIST }
            )

            // Screen 6 & 7: Daily activities, worksheets & Answer submission
            ScreenState.WORKSHEET_ACTIVITY -> WorksheetActivityScreen(
                dayNumber = currentDay,
                studentId = loggedInStudentId,
                database = database,
                lang = selectedLanguage,
                onSubmitComplete = {
                    currentScreen = ScreenState.SUBMISSION_CONFIRMATION
                },
                onBack = { currentScreen = ScreenState.PROJECT_INSTRUCTIONS }
            )

            // Screen 7 post-submit confirmation & Screen 8 feedback trigger
            ScreenState.SUBMISSION_CONFIRMATION -> SubmissionConfirmationScreen(
                lang = selectedLanguage,
                onViewFeedback = { currentScreen = ScreenState.FEEDBACK_VIEW },
                onReturnHome = { currentScreen = ScreenState.DASHBOARD }
            )

            // Screen 8: Learning feedback
            ScreenState.FEEDBACK_VIEW -> FeedbackViewScreen(
                lang = selectedLanguage,
                onBack = { currentScreen = ScreenState.DASHBOARD }
            )

            // Screen 9: My Progress
            ScreenState.PROGRESS_VIEW -> MyProgressScreen(
                studentName = studentName,
                lang = selectedLanguage,
                onBack = { currentScreen = ScreenState.DASHBOARD }
            )

            // Screen 10: Offline content and synchronization status
            ScreenState.SYNC_STATUS -> OfflineSyncStatusScreen(
                database = database,
                lang = selectedLanguage,
                onBack = { currentScreen = ScreenState.DASHBOARD }
            )

            // Screen 11: Settings and logout
            ScreenState.SETTINGS_LOGOUT -> SettingsLogoutScreen(
                database = database,
                lang = selectedLanguage,
                onLogout = {
                    currentScreen = ScreenState.WELCOME_LANGUAGE
                },
                onBack = { currentScreen = ScreenState.DASHBOARD }
            )
        }
    }
}

// ==========================================
// SCREEN 1: Welcome & Language Selection
// ==========================================
@Composable
fun WelcomeLanguageScreen(
    currentLang: String,
    onLanguageSelected: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterVertically,
        verticalArrangement = Arrangement.Center
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = BrandLightGreen),
            modifier = Modifier.size(80.dp)
        ) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = "📖", fontSize = 40.sp)
            }
        }
        Spacer(modifier = Modifier.height(20.dp))
        Text(
            text = "शिक्षासेतु",
            fontSize = 32.sp,
            fontWeight = FontWeight.Black,
            color = TextDark
        )
        Text(
            text = "करके सीखें, समझकर बढ़ें",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = BrandGreen
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Learn by Doing, Grow by Understanding",
            fontSize = 12.sp,
            color = TextMuted
        )

        Spacer(modifier = Modifier.height(48.dp))
        Text(
            text = "भाषा का चयन करें / Select Language",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = TextDark
        )
        Spacer(modifier = Modifier.height(16.dp))

        // Hindi First Option
        Button(
            onClick = { onLanguageSelected("hi") },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = BrandGreen)
        ) {
            Text(text = "हिंदी (मुख्य भाषा)", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(12.dp))

        // English Option
        OutlinedButton(
            onClick = { onLanguageSelected("en") },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text(text = "English", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }
    }
}

// ==========================================
// SCREEN 2: Student ID + PIN Login
// ==========================================
@Composable
fun StudentLoginScreen(
    lang: String,
    onLoginSuccess: (String, String) -> Unit,
    onBack: () -> Unit
) {
    var studentId by remember { mutableStateOf("STU-1001") }
    var pin by remember { mutableStateOf("4321") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (lang == "hi") "विद्यार्थी प्रवेश" else "Student Sign In",
            fontSize = 26.sp,
            fontWeight = FontWeight.Black,
            color = TextDark
        )
        Text(
            text = if (lang == "hi") "कक्षा 6 के छात्र आईडी और 4-अंकीय पिन से प्रवेश करें" else "Sign in with your Student ID and 4-digit PIN",
            fontSize = 13.sp,
            color = TextMuted
        )
        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = studentId,
            onValueChange = { studentId = it.uppercase() },
            label = { Text(if (lang == "hi") "विद्यार्थी आईडी (Student ID)" else "Student ID") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = pin,
            onValueChange = { if (it.length <= 6) pin = it },
            label = { Text(if (lang == "hi") "सुरक्षा पिन (PIN)" else "Security PIN") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp)
        )

        errorMessage?.let {
            Spacer(modifier = Modifier.height(12.dp))
            Text(text = it, color = Color.Red, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(28.dp))

        Button(
            onClick = {
                if (studentId == "STU-1001" && pin == "4321") {
                    onLoginSuccess("STU-1001", "आरव कुमार")
                } else if (studentId == "STU-1002" && pin == "4321") {
                    onLoginSuccess("STU-1002", "प्रिया सिंह")
                } else {
                    errorMessage = if (lang == "hi") "अमान्य आईडी या पिन। पुनः प्रयास करें।" else "Invalid Student ID or PIN."
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = BrandGreen)
        ) {
            Text(
                text = if (lang == "hi") "प्रवेश करें (Sign In)" else "Sign In",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(16.dp))
        TextButton(
            onClick = onBack,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        ) {
            Text(text = "← वापस जाएं (Back)", color = TextMuted)
        }
    }
}

// ==========================================
// SCREEN 3: Student Home Dashboard
// ==========================================
@Composable
fun StudentDashboardScreen(
    studentName: String,
    studentId: String,
    lang: String,
    onOpenProjects: () -> Unit,
    onOpenProgress: () -> Unit,
    onOpenSync: () -> Unit,
    onOpenSettings: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = BrandGreen),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(text = "कक्षा 6 • Class 6", color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(text = "नमस्ते, $studentName!", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Black)
                    Text(text = "आईडी: $studentId • राजकीय उच्च प्राथमिक विद्यालय", color = Color.White.copy(alpha = 0.9f), fontSize = 12.sp)
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        item {
            Text(
                text = if (lang == "hi") "सक्रिय परियोजना (Active Project)" else "Active Project",
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                color = TextDark
            )
            Spacer(modifier = Modifier.height(10.dp))

            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpenProjects() }
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "💧 जल संरक्षण: समझें डेटा, बचाएं जल", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = BrandGreen)
                    Text(text = "3-दिवसीय प्रायोगिक कार्य • दिवस 1, 2, 3 उपलब्ध हैं", fontSize = 12.sp, color = TextMuted)
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = onOpenProjects,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandGreen)
                    ) {
                        Text(text = if (lang == "hi") "कार्यपत्रक खोलें →" else "Open Worksheets →", fontSize = 13.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = onOpenProgress,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White)
                ) {
                    Text(text = "🏆 मेरी प्रगति", color = TextDark, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = onOpenSync,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White)
                ) {
                    Text(text = "🔄 ऑफ़लाइन सिंक", color = TextDark, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedButton(
                onClick = onOpenSettings,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(text = "⚙️ सेटिंग्स एवं सुरक्षित प्रस्थान (Sign Out)", color = TextMuted, fontSize = 13.sp)
            }
        }
    }
}

// ==========================================
// SCREEN 4: My Learning Projects
// ==========================================
@Composable
fun ProjectsListScreen(
    lang: String,
    onSelectProject: () -> Unit,
    onBack: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text = "←", fontSize = 24.sp, modifier = Modifier.clickable { onBack() })
            Spacer(modifier = Modifier.width(12.dp))
            Text(text = "मेरी सीखने की परियोजनाएं", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(16.dp))

        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth().clickable { onSelectProject() }
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "पर्यावरण एवं विज्ञान", color = SaffronOrange, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text(text = "जल संरक्षण: समझें डेटा, बचाएं जल", fontSize = 16.sp, fontWeight = FontWeight.Black)
                Text(text = "कक्षा 6 • 3 दिवस • डेटा तालिकाएं, बार चार्ट व समाधान", fontSize = 12.sp, color = TextMuted)
            }
        }
    }
}

// ==========================================
// SCREEN 5: Project Instructions
// ==========================================
@Composable
fun ProjectInstructionsScreen(
    lang: String,
    onStartDay: (Int) -> Unit,
    onBack: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text = "←", fontSize = 24.sp, modifier = Modifier.clickable { onBack() })
            Spacer(modifier = Modifier.width(12.dp))
            Text(text = "परियोजना निर्देश", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(16.dp))

        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = BrandLightGreen),
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "लक्ष्य: पानी की बर्बादी रोकना व सरल डेटा समझना", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = BrandGreen)
                Text(text = "दैनिक जीवन में होने वाले रिसाव का सुरक्षित अवलोकन करें।", fontSize = 12.sp, color = TextDark)
            }
        }

        // Days 1, 2, 3 buttons
        listOf(
            Triple(1, "दिवस 1: निरीक्षण और पहचान", "दैनिक उपयोग व व्यर्थ बहाव"),
            Triple(2, "दिवस 2: डेटा संग्रह और समझ", "संख्या तालिका व बार चार्ट"),
            Triple(3, "दिवस 3: व्यावहारिक समाधान", "ठोस सुझाव व प्रस्तुति")
        ).forEach { (day, title, desc) ->
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp).clickable { onStartDay(day) }
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text(text = desc, fontSize = 12.sp, color = TextMuted)
                    }
                    Text(text = "शुरू करें →", color = BrandGreen, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }
        }
    }
}

// ==========================================
// SCREEN 6 & 7: Worksheet Activity & Answer Submission
// ==========================================
@Composable
fun WorksheetActivityScreen(
    dayNumber: Int,
    studentId: String,
    database: AppDatabase,
    lang: String,
    onSubmitComplete: () -> Unit,
    onBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var ans1 by remember { mutableStateOf("") }
    var ans2 by remember { mutableStateOf("") }
    var isSaving by remember { mutableStateOf(false) }

    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "←", fontSize = 24.sp, modifier = Modifier.clickable { onBack() })
                Spacer(modifier = Modifier.width(12.dp))
                Text(text = "कार्यपत्रक: दिवस $dayNumber", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        item {
            if (dayNumber == 1) {
                Text(text = "1. दैनिक जीवन में पानी कहाँ उपयोग होता है?", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = ans1,
                    onValueChange = { ans1 = it },
                    placeholder = { Text("उदा. पीने और खाना बनाने में") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(14.dp))
                Text(text = "2. पानी की बर्बादी रोकने का एक तरीका बताएं:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = ans2,
                    onValueChange = { ans2 = it },
                    placeholder = { Text("उदा. उपयोग के बाद नल कसकर बंद करना") },
                    modifier = Modifier.fillMaxWidth()
                )
            } else if (dayNumber == 2) {
                Text(text = "1. सबसे अधिक बर्बादी किस कारण से हुई?", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = ans1,
                    onValueChange = { ans1 = it },
                    placeholder = { Text("उदा. खुला छोड़ा गया नल (5 नल)") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(14.dp))
                Text(text = "2. यह डेटा क्या दर्शाता है?", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = ans2,
                    onValueChange = { ans2 = it },
                    placeholder = { Text("उदा. लोग नल बंद करना भूल जाते हैं") },
                    modifier = Modifier.fillMaxWidth()
                )
            } else {
                Text(text = "1. पहला व्यावहारिक सुझाव:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = ans1,
                    onValueChange = { ans1 = it },
                    placeholder = { Text("उदा. बाल्टी का उपयोग करना") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(14.dp))
                Text(text = "2. दूसरा व्यावहारिक सुझाव:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = ans2,
                    onValueChange = { ans2 = it },
                    placeholder = { Text("उदा. टपकते नल की सूचना शिक्षक को देना") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    isSaving = true
                    coroutineScope.launch {
                        val record = SubmissionEntity(
                            clientIdempotencyKey = "android-sub-" + UUID.randomUUID().toString(),
                            projectId = "proj-water-01",
                            activityId = "act-water-d$dayNumber",
                            dayNumber = dayNumber,
                            studentId = studentId,
                            classId = "cls-rampur-6a",
                            answersJson = """{"answer_1":"$ans1","answer_2":"$ans2"}""",
                            clientTimestamp = System.currentTimeMillis().toString(),
                            syncStatus = "PENDING"
                        )
                        database.submissionDao().insertSubmission(record)
                        isSaving = false
                        onSubmitComplete()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = BrandGreen)
            ) {
                Text(text = if (isSaving) "सहेजा जा रहा है..." else "कार्यपत्रक जमा करें (Submit)", fontWeight = FontWeight.Bold)
            }
        }
    }
}

// ==========================================
// SCREEN 7 Post-Submit & SCREEN 8 Feedback
// ==========================================
@Composable
fun SubmissionConfirmationScreen(
    lang: String,
    onViewFeedback: () -> Unit,
    onReturnHome: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterVertically,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "✅", fontSize = 48.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(text = "कार्यपत्रक सुरक्षित सहेजा गया!", fontSize = 20.sp, fontWeight = FontWeight.Black)
        Text(text = "डेटा आपके फोन पर सुरक्षित है। नेटवर्क मिलने पर शिक्षक को सिंक हो जाएगा।", fontSize = 13.sp, color = TextMuted)
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onViewFeedback, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = BrandGreen)) {
            Text(text = "शिक्षक की प्रतिक्रिया देखें")
        }
        Spacer(modifier = Modifier.height(10.dp))
        OutlinedButton(onClick = onReturnHome, modifier = Modifier.fillMaxWidth()) {
            Text(text = "मुख्य पृष्ठ पर लौटें")
        }
    }
}

@Composable
fun FeedbackViewScreen(lang: String, onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text = "←", fontSize = 24.sp, modifier = Modifier.clickable { onBack() })
            Spacer(modifier = Modifier.width(12.dp))
            Text(text = "शिक्षक की टिप्पणी", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(20.dp))
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "अनीता शर्मा (विज्ञान शिक्षिका)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = BrandGreen)
                Spacer(modifier = Modifier.height(6.dp))
                Text(text = "शानदार अवलोकन! आपने पानी की बर्बादी और इसके व्यावहारिक उपायों को बहुत अच्छे से समझाया है।", fontSize = 14.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "रूब्रिक: स्वतंत्र रूप से प्राप्त (Achieved)", color = SaffronOrange, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

// ==========================================
// SCREEN 9: My Progress
// ==========================================
@Composable
fun MyProgressScreen(studentName: String, lang: String, onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text = "←", fontSize = 24.sp, modifier = Modifier.clickable { onBack() })
            Spacer(modifier = Modifier.width(12.dp))
            Text(text = "मेरी प्रगति (My Progress)", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(20.dp))
        Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "जल संरक्षण परियोजना: 3/3 दिवस पूर्ण", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(text = "कोई सार्वजनिक रैंकिंग नहीं की जाती। केवल व्यक्तिगत प्रगति दर्ज है।", fontSize = 12.sp, color = TextMuted)
            }
        }
    }
}

// ==========================================
// SCREEN 10: Offline Sync Status
// ==========================================
@Composable
fun OfflineSyncStatusScreen(database: AppDatabase, lang: String, onBack: () -> Unit) {
    val pendingCount by database.submissionDao().observePendingCount().collectAsState(initial = 0)

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text = "←", fontSize = 24.sp, modifier = Modifier.clickable { onBack() })
            Spacer(modifier = Modifier.width(12.dp))
            Text(text = "ऑफ़लाइन सिंक स्थिति", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(20.dp))
        Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = Color.White), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "लंबित सिंक कार्यपत्रक: $pendingCount", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Text(text = if (pendingCount == 0) "सभी कार्यपत्रक सर्वर पर सुरक्षित सिंक हो चुके हैं।" else "इंटरनेट जुड़ते ही कार्य स्वतः सिंक हो जाएगा।", fontSize = 12.sp, color = TextMuted)
            }
        }
    }
}

// ==========================================
// SCREEN 11: Settings and Logout
// ==========================================
@Composable
fun SettingsLogoutScreen(database: AppDatabase, lang: String, onLogout: () -> Unit, onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text = "←", fontSize = 24.sp, modifier = Modifier.clickable { onBack() })
            Spacer(modifier = Modifier.width(12.dp))
            Text(text = "सेटिंग्स एवं प्रस्थान", fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = onLogout,
            colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(text = "सुरक्षित प्रस्थान (Sign Out)", color = Color.White, fontWeight = FontWeight.Bold)
        }
    }
}
