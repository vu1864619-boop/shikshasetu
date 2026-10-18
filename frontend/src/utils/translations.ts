export type Language = 'hi' | 'en';

export const translations = {
  hi: {
    platformName: 'शिक्षासेतु',
    tagline: 'करके सीखें, समझकर बढ़ें',
    subtitle: 'व्यावहारिक शिक्षा एवं अधिगम संवर्धन मंच',
    welcome: 'नमस्ते',
    loginAsStudent: 'विद्यार्थी प्रवेश (Student Login)',
    loginAsTeacher: 'शिक्षक / व्यवस्थापक प्रवेश (Staff Login)',
    studentIdLabel: 'विद्यार्थी पहचान संख्या (Student ID)',
    studentIdPlaceholder: 'उदा. STU-1001',
    pinLabel: 'सुरक्षा पिन (4-6 अंक)',
    pinPlaceholder: 'अपना पिन दर्ज करें',
    loginBtn: 'प्रवेश करें',
    logoutBtn: 'सुरक्षित प्रस्थान (Sign Out)',
    languageToggle: 'English में बदलें',
    offlineStatus: 'ऑफ़लाइन मोड (डेटा स्थानीय रूप से सुरक्षित है)',
    onlineStatus: 'ऑनलाइन जुड़ा हुआ है',
    pendingSyncCount: 'प्रतीक्षारत सिंक',
    syncNowBtn: 'अभी सिंक करें',
    syncedSuccess: 'डेटा सर्वर पर सुरक्षित सिंक हो गया है!',
    
    // Student Dashboard
    myProjects: 'मेरी सीखने की परियोजनाएं',
    myProgress: 'मेरी प्रगति एवं परिणाम',
    activeProjectTag: 'सक्रिय परियोजना',
    startActivityBtn: 'गतिविधि शुरू करें',
    completedTag: 'पूर्ण',
    missingTag: 'अपूर्ण कार्य',
    
    // Water Project Day 1
    waterProjectTitle: 'जल संरक्षण: समझें डेटा, बचाएं जल',
    waterProjectGrade: 'कक्षा 6 • विज्ञान एवं पर्यावरण • 3 दिवसीय परियोजना',
    day1Title: 'दिवस 1: पानी के उपयोग का निरीक्षण और व्यर्थ बहाव की पहचान',
    day1Objective: 'समझें कि स्वच्छ जल क्यों अनमोल है और दैनिक जीवन में पानी कहाँ व्यर्थ बहता है।',
    day1Q1: '1. दैनिक जीवन में घर या विद्यालय में पानी के दो मुख्य उपयोग बताएं:',
    day1Q2: '2. आपने पानी की बर्बादी या रिसाव कहाँ देखा या अनुमान लगाया?',
    day1Q3: '3. पानी की बर्बादी तुरंत रोकने के दो व्यावहारिक तरीके क्या हैं?',
    submitAnswerBtn: 'कार्यपत्रक जमा करें',
    saveDraftOfflineBtn: 'ऑफ़लाइन सहेजें',

    // Water Project Day 2
    day2Title: 'दिवस 2: डेटा संग्रह और समझ',
    day2Objective: 'अवलोकनों को सरल तालिका में व्यवस्थित करें, बार चार्ट समझें और सबसे बड़ी समस्या पहचानें।',
    day2SampleNotice: 'नोट: नीचे दिया गया डेटा कक्षा 6 के सीखने हेतु एक प्रामाणिक उदाहरण है:',
    day2TableHeading: 'पानी की अनावश्यक बर्बादी के देखे गए उदाहरण',
    day2Q1: '1. तालिका के अनुसार, सबसे अधिक पानी की बर्बादी किस कारण से हुई?',
    day2Q2: '2. यह डेटा हमारी दैनिक आदतों के बारे में क्या दर्शाता है?',
    
    // Water Project Day 3
    day3Title: 'दिवस 3: व्यावहारिक समाधान और प्रस्तुति',
    day3Objective: 'एकत्रित डेटा के आधार पर पानी बचाने के 2 व्यावहारिक उपाय प्रस्तावित करें।',
    day3Q1: '1. पहला व्यावहारिक सुझाव (Recommendation 1):',
    day3Q2: '2. दूसरा व्यावहारिक सुझाव (Recommendation 2):',
    day3Q3: '3. समझाएं कि आपका सुझाव दिवस 2 के आंकड़ों से कैसे मेल खाता है:',

    // Feedback & Rubric
    teacherFeedback: 'शिक्षक की टिप्पणी एवं मार्गदर्शन',
    rubricAchieved: 'स्वतंत्र रूप से प्राप्त (Achieved)',
    rubricDeveloping: 'विकासशील / मार्गदर्शन के साथ (Developing)',
    rubricNeedsSupport: 'सहायता आवश्यक (Needs Support)',
    nextRecommendation: 'अगली सीखने की दिशा',

    // Teacher Portal
    teacherDashboard: 'शिक्षक नियंत्रण कक्ष',
    classroomManagement: 'कक्षा प्रबंधन',
    classroomModeProjector: 'कक्षा प्रोजेक्टर मोड (बिना फ़ोन की कक्षा)',
    printableWorksheets: 'प्रिंट करने योग्य कार्यपत्रक',
    reviewSubmissions: 'विद्यार्थी कार्य मूल्यांकन',
    learningReports: 'अधिगम प्रगति रिपोर्ट',
    pinResetTitle: 'विद्यार्थी पिन रीसेट (PIN Reset)',
    createClassBtn: '+ नई कक्षा बनाएं',
    enrollStudentBtn: '+ नया विद्यार्थी नामांकित करें',
    printBtn: 'प्रिंट करें / PDF सहेजें',
    singleDeviceNotice: 'कक्षा में छात्रों के पास व्यक्तिगत स्मार्टफोन होना आवश्यक नहीं है। शिक्षक स्क्रीन या प्रिंटेड कार्यपत्रक से पूरी कक्षा संचालित कर सकते हैं।'
  },
  en: {
    platformName: 'ShikshaSetu',
    tagline: 'Learn by Doing, Grow by Understanding',
    subtitle: 'Practical Learning & Education Improvement Platform',
    welcome: 'Welcome',
    loginAsStudent: 'Student Login',
    loginAsTeacher: 'Teacher / Admin Login',
    studentIdLabel: 'Student ID Code',
    studentIdPlaceholder: 'e.g. STU-1001',
    pinLabel: 'Security PIN (4-6 digits)',
    pinPlaceholder: 'Enter your PIN',
    loginBtn: 'Sign In',
    logoutBtn: 'Safe Sign Out',
    languageToggle: 'हिंदी में देखें',
    offlineStatus: 'Offline Mode (Data safely stored locally)',
    onlineStatus: 'Connected Online',
    pendingSyncCount: 'Pending Sync',
    syncNowBtn: 'Sync Now',
    syncedSuccess: 'Data confirmed and synced to server!',

    // Student Dashboard
    myProjects: 'My Learning Projects',
    myProgress: 'My Progress & Feedback',
    activeProjectTag: 'Active Project',
    startActivityBtn: 'Start Activity',
    completedTag: 'Completed',
    missingTag: 'Missing Work',

    // Water Project Day 1
    waterProjectTitle: 'Save Water, Understand Data',
    waterProjectGrade: 'Class 6 • Science & Environment • 3-Day Project',
    day1Title: 'Day 1: Observe and Identify Water Waste',
    day1Objective: 'Understand why water is precious and identify where leaks and waste occur.',
    day1Q1: '1. Name two common places where water is used daily at home or school:',
    day1Q2: '2. Where did you observe or estimate unnecessary water waste?',
    day1Q3: '3. What are two practical ways to reduce water waste right away?',
    submitAnswerBtn: 'Submit Worksheet',
    saveDraftOfflineBtn: 'Save Draft Offline',

    // Water Project Day 2
    day2Title: 'Day 2: Collect and Understand Data',
    day2Objective: 'Organize observations in a simple table, understand the bar chart, and identify the largest category.',
    day2SampleNotice: 'Note: The data below is illustrative example data for Class 6 learning:',
    day2TableHeading: 'Observed Instances of Unnecessary Water Use',
    day2Q1: '1. According to the table, which water-waste issue had the highest count?',
    day2Q2: '2. What does this data tell us about everyday habits?',

    // Water Project Day 3
    day3Title: 'Day 3: Propose and Present Practical Solutions',
    day3Objective: 'Propose 2 actionable water-saving solutions grounded in the collected data.',
    day3Q1: '1. Practical Recommendation 1:',
    day3Q2: '2. Practical Recommendation 2:',
    day3Q3: '3. Explain how your recommendations directly solve the Day 2 data findings:',

    // Feedback & Rubric
    teacherFeedback: 'Teacher Feedback & Guidance',
    rubricAchieved: 'Achieved Independently',
    rubricDeveloping: 'Developing with Guidance',
    rubricNeedsSupport: 'Needs Support & Practice',
    nextRecommendation: 'Next Learning Recommendation',

    // Teacher Portal
    teacherDashboard: 'Teacher Dashboard',
    classroomManagement: 'Classroom Management',
    classroomModeProjector: 'Classroom Projector Mode (No Phones Needed)',
    printableWorksheets: 'Printable Worksheets',
    reviewSubmissions: 'Evaluate Submissions',
    learningReports: 'Learning Outcome Reports',
    pinResetTitle: 'Student PIN Reset',
    createClassBtn: '+ Create New Class',
    enrollStudentBtn: '+ Enroll Student',
    printBtn: 'Print / Save as PDF',
    singleDeviceNotice: 'Personal smartphones are never required for students. Teachers can project instructions or distribute printed worksheets for the entire class.'
  }
};
