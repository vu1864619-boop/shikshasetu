import { dbManager } from './database.js';
import { hashPin } from '../auth/hasher.js';

export function seedDatabase(): void {
  const db = dbManager.getDb();

  // Clear existing data in reverse order of foreign keys
  db.exec(`
    DELETE FROM assessments;
    DELETE FROM submissions;
    DELETE FROM learning_objectives;
    DELETE FROM project_activities;
    DELETE FROM projects;
    DELETE FROM student_enrollments;
    DELETE FROM class_teachers;
    DELETE FROM classes;
    DELETE FROM audit_logs;
    DELETE FROM users;
    DELETE FROM schools;
  `);

  console.log('Seeding schools...');
  const school1Id = 'sch-rampur-001';
  const school2Id = 'sch-behrampur-002';

  dbManager.run(
    `INSERT INTO schools (id, name, udise_code, district, state, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [school1Id, 'राजकीय उच्च प्राथमिक विद्यालय, रामपुर (GUPS Rampur)', '08120401201', 'Jaipur', 'Rajasthan', 1]
  );

  dbManager.run(
    `INSERT INTO schools (id, name, udise_code, district, state, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [school2Id, 'राजकीय माध्यमिक विद्यालय, बहरामपुर (GSS Behrampur)', '08120401202', 'Alwar', 'Rajasthan', 1]
  );

  console.log('Seeding users...');
  // Platform Admin
  const adminHash = hashPin('999999');
  dbManager.run(
    `INSERT INTO users (id, role, school_id, name, email, salt, hashed_pin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['usr-admin-01', 'platform_admin', school1Id, 'System Admin (प्रशासक)', 'admin@shikshasetu.org', adminHash.salt, adminHash.hash]
  );

  // School 1 Admin
  const schAdminHash = hashPin('888888');
  dbManager.run(
    `INSERT INTO users (id, role, school_id, name, email, salt, hashed_pin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['usr-sch-admin-01', 'school_admin', school1Id, 'सुरेश चंद शर्मा (प्रधानाध्यापक)', 'admin.rampur@shikshasetu.org', schAdminHash.salt, schAdminHash.hash]
  );

  // Teacher 1 (School 1)
  const teacher1Hash = hashPin('123456');
  dbManager.run(
    `INSERT INTO users (id, role, school_id, name, email, salt, hashed_pin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['usr-teacher-01', 'teacher', school1Id, 'श्रीमती अनीता शर्मा (विज्ञान शिक्षिका)', 'anita.sharma@shikshasetu.org', teacher1Hash.salt, teacher1Hash.hash]
  );

  // Teacher 2 (School 2)
  const teacher2Hash = hashPin('123456');
  dbManager.run(
    `INSERT INTO users (id, role, school_id, name, email, salt, hashed_pin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['usr-teacher-02', 'teacher', school2Id, 'श्री विक्रम सिंह (विज्ञान शिक्षक)', 'vikram.singh@shikshasetu.org', teacher2Hash.salt, teacher2Hash.hash]
  );

  // Student 1 (School 1)
  const stu1Hash = hashPin('4321');
  dbManager.run(
    `INSERT INTO users (id, role, school_id, student_id_code, name, salt, hashed_pin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['usr-student-01', 'student', school1Id, 'STU-1001', 'आरव कुमार (Aarav Kumar)', stu1Hash.salt, stu1Hash.hash]
  );

  // Student 2 (School 1)
  const stu2Hash = hashPin('4321');
  dbManager.run(
    `INSERT INTO users (id, role, school_id, student_id_code, name, salt, hashed_pin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['usr-student-02', 'student', school1Id, 'STU-1002', 'प्रिया सिंह (Priya Singh)', stu2Hash.salt, stu2Hash.hash]
  );

  // Student 3 (School 1)
  const stu3Hash = hashPin('4321');
  dbManager.run(
    `INSERT INTO users (id, role, school_id, student_id_code, name, salt, hashed_pin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['usr-student-03', 'student', school1Id, 'STU-1003', 'रोहन वर्मा (Rohan Verma)', stu3Hash.salt, stu3Hash.hash]
  );

  // Student 4 (School 2 - Isolation testing)
  const stu4Hash = hashPin('4321');
  dbManager.run(
    `INSERT INTO users (id, role, school_id, student_id_code, name, salt, hashed_pin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['usr-student-04', 'student', school2Id, 'STU-2001', 'दीपक शर्मा (Deepak Sharma)', stu4Hash.salt, stu4Hash.hash]
  );

  console.log('Seeding classrooms...');
  const class1Id = 'cls-rampur-6a';
  dbManager.run(
    `INSERT INTO classes (id, school_id, name, grade_level, section, join_code, academic_year)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [class1Id, school1Id, 'कक्षा 6-अ (Class 6-A)', 6, 'A', 'WATR6A', '2026-27']
  );

  // Class teacher assignment
  dbManager.run(
    `INSERT INTO class_teachers (id, class_id, teacher_id)
     VALUES (?, ?, ?)`,
    ['ct-01', class1Id, 'usr-teacher-01']
  );

  // Student enrollments
  dbManager.run(`INSERT INTO student_enrollments (id, class_id, student_id, roll_number) VALUES (?, ?, ?, ?)`, ['enr-01', class1Id, 'usr-student-01', '01']);
  dbManager.run(`INSERT INTO student_enrollments (id, class_id, student_id, roll_number) VALUES (?, ?, ?, ?)`, ['enr-02', class1Id, 'usr-student-02', '02']);
  dbManager.run(`INSERT INTO student_enrollments (id, class_id, student_id, roll_number) VALUES (?, ?, ?, ?)`, ['enr-03', class1Id, 'usr-student-03', '03']);

  console.log('Seeding Water Conservation Project...');
  const projectId = 'proj-water-01';
  dbManager.run(
    `INSERT INTO projects (id, title_en, title_hi, description_en, description_hi, grade_level, duration_days, category, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      projectId,
      'Save Water, Understand Data',
      'जल संरक्षण: समझें डेटा, बचाएं जल',
      'A 3-day practical project for Class 6 to observe everyday water use, analyze leak patterns with simple data tables and charts, and propose actionable water-saving solutions.',
      'कक्षा 6 के लिए 3 दिवसीय व्यावहारिक परियोजना: दैनिक जल उपयोग का निरीक्षण करें, डेटा तालिकाओं और चार्ट से रिसाव के रुझान समझें, और जल बचाने के व्यावहारिक उपाय प्रस्तुत करें।',
      6,
      3,
      'Environment & Science',
      1
    ]
  );

  // Project Activities (Day 1, 2, 3)
  const act1Id = 'act-water-d1';
  dbManager.run(
    `INSERT INTO project_activities (id, project_id, day_number, title_en, title_hi, objective_en, objective_hi, instructions_en, instructions_hi, worksheet_template_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      act1Id,
      projectId,
      1,
      'Day 1: Observe and Identify Water Waste',
      'दिवस 1: पानी के उपयोग का निरीक्षण और व्यर्थ बहाव की पहचान',
      'Understand why water conservation matters and identify common causes of water waste at home and school.',
      'जल संरक्षण का महत्व समझें और घर तथा विद्यालय में पानी की बर्बादी के सामान्य कारणों की पहचान करें।',
      'Observe where water is used and where it might be wasted. Complete the observation worksheet. Disclosing private household information is never required; safe estimates and observations are encouraged.',
      'घर या विद्यालय में पानी के उपयोग और व्यर्थ बहाव का ध्यानपूर्वक निरीक्षण करें। अवलोकन कार्यपत्रक भरें। किसी भी व्यक्तिगत घरेलू जानकारी को साझा करने की आवश्यकता नहीं है; अनुमान और सामान्य अवलोकन पर्याप्त हैं।',
      JSON.stringify({
        fields: [
          { key: 'water_uses', label_en: 'Name two common places where water is used daily', label_hi: 'दैनिक जीवन में पानी के दो प्रमुख उपयोग बताएं', type: 'text' },
          { key: 'observed_waste', label_en: 'Where did you observe or estimate unnecessary water waste?', label_hi: 'आपने पानी की बर्बादी या रिसाव कहाँ देखा या अनुमान लगाया?', type: 'textarea' },
          { key: 'initial_methods', label_en: 'What are two practical ways to reduce water waste right away?', label_hi: 'पानी की बर्बादी तुरंत रोकने के दो व्यावहारिक तरीके क्या हैं?', type: 'textarea' }
        ]
      })
    ]
  );

  const act2Id = 'act-water-d2';
  dbManager.run(
    `INSERT INTO project_activities (id, project_id, day_number, title_en, title_hi, objective_en, objective_hi, instructions_en, instructions_hi, worksheet_template_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      act2Id,
      projectId,
      2,
      'Day 2: Collect and Understand Data',
      'दिवस 2: डेटा संग्रह और समझ',
      'Count and organize observations into a simple table, draw a basic bar chart, and interpret the largest waste category.',
      'अवलोकनों को सरल तालिका में व्यवस्थित करें, बुनियादी बार चार्ट बनाएं और सबसे बड़ी समस्या की पहचान करें।',
      'Use your real observations or the provided sample dataset (Leaking tap: 3, Tap left running: 5, Unnecessary overflow: 2). Count each category, complete the table, and identify which issue is most frequent.',
      'अपने वास्तविक अवलोकन या दिए गए उदाहरण डेटा (टपकता नल: 3, खुला छोड़ा गया नल: 5, टंकी का ओवरफ्लो: 2) का उपयोग करें। तालिका भरें और बताएं कि सबसे अधिक बर्बादी किस कारण से हुई।',
      JSON.stringify({
        sample_data: [
          { issue: 'Leaking tap (टपकता नल)', count: 3 },
          { issue: 'Tap left running (खुला छोड़ा गया नल)', count: 5 },
          { issue: 'Unnecessary overflow (टंकी का ओवरफ्लो)', count: 2 }
        ],
        fields: [
          { key: 'table_data', label_en: 'Enter counts: Leaking tap, Running tap, Overflow', label_hi: 'संख्या दर्ज करें: टपकता नल, खुला नल, ओवरफ्लो', type: 'table' },
          { key: 'highest_issue', label_en: 'Which water-waste issue had the highest count?', label_hi: 'सबसे अधिक बार कौन सी बर्बादी देखी गई?', type: 'select', options: ['Leaking tap', 'Tap left running', 'Unnecessary overflow'] },
          { key: 'data_explanation', label_en: 'What does this data tell us about our habits?', label_hi: 'यह डेटा हमारी आदतों के बारे में क्या दर्शाता है?', type: 'textarea' }
        ]
      })
    ]
  );

  const act3Id = 'act-water-d3';
  dbManager.run(
    `INSERT INTO project_activities (id, project_id, day_number, title_en, title_hi, objective_en, objective_hi, instructions_en, instructions_hi, worksheet_template_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      act3Id,
      projectId,
      3,
      'Day 3: Propose and Present Practical Solutions',
      'दिवस 3: व्यावहारिक समाधान और प्रस्तुति',
      'Propose two practical water-saving actions grounded in collected data and communicate the recommendations clearly.',
      'एकत्रित डेटा पर आधारित पानी बचाने के दो ठोस उपाय प्रस्तावित करें और निष्कर्ष स्पष्ट रूप से समझाएं।',
      'Work individually or in small groups. Write two practical recommendations that directly solve the waste identified on Day 2 (e.g. turn off taps tightly, report leaks to adults). Submit your response or have the teacher record group findings.',
      'व्यक्तिगत या समूह में कार्य करें। दिवस 2 के निष्कर्षों के आधार पर पानी बचाने के दो ठोस सुझाव लिखें (जैसे नल कसकर बंद करना, रिसाव की सूचना बड़ों को देना)। उत्तर ऑनलाइन जमा करें या शिक्षक समूह कार्य दर्ज करें।',
      JSON.stringify({
        fields: [
          { key: 'recommendation_1', label_en: 'Practical Recommendation 1', label_hi: 'पहला व्यावहारिक सुझाव', type: 'text' },
          { key: 'recommendation_2', label_en: 'Practical Recommendation 2', label_hi: 'दूसरा व्यावहारिक सुझाव', type: 'text' },
          { key: 'connection_to_data', label_en: 'How does your solution address the Day 2 data findings?', label_hi: 'आपका यह समाधान दिवस 2 के आंकड़ों से कैसे जुड़ा हुआ है?', type: 'textarea' }
        ]
      })
    ]
  );

  // Learning Objectives
  console.log('Seeding learning objectives...');
  const objectives = [
    {
      id: 'lo-water-01',
      code: 'LO-WATER-01',
      day: 1,
      en: 'Understand Water Conservation Importance',
      hi: 'जल संरक्षण का महत्व समझना',
      desc_en: 'Student explains why fresh water is precious and why waste must be minimized.',
      desc_hi: 'विद्यार्थी समझाता है कि स्वच्छ जल क्यों अनमोल है और बर्बादी रोकना क्यों आवश्यक है।'
    },
    {
      id: 'lo-water-02',
      code: 'LO-WATER-02',
      day: 1,
      en: 'Identify Waste Causes',
      hi: 'पानी की बर्बादी के कारणों की पहचान',
      desc_en: 'Student accurately identifies everyday sources of water leaks and negligence.',
      desc_hi: 'विद्यार्थी पानी के रिसाव और लापरवाही के दैनिक स्रोतों की सही पहचान करता है।'
    },
    {
      id: 'lo-water-03',
      code: 'LO-WATER-03',
      day: 2,
      en: 'Organize Data in Table',
      hi: 'डेटा को तालिका में व्यवस्थित करना',
      desc_en: 'Student organizes counts and observations accurately into categories.',
      desc_hi: 'विद्यार्थी अवलोकनों को श्रेणियों में सही ढंग से गिनकर तालिकाबद्ध करता है।'
    },
    {
      id: 'lo-water-04',
      code: 'LO-WATER-04',
      day: 2,
      en: 'Interpret Patterns from Data',
      hi: 'डेटा से निष्कर्ष निकालना',
      desc_en: 'Student correctly identifies the largest waste category and derives meaning from numbers.',
      desc_hi: 'विद्यार्थी सबसे बड़ी श्रेणी की पहचान करता है और संख्याओं का सही अर्थ निकालता है।'
    },
    {
      id: 'lo-water-05',
      code: 'LO-WATER-05',
      day: 3,
      en: 'Formulate Practical Solutions',
      hi: 'व्यावहारिक समाधान तैयार करना',
      desc_en: 'Student proposes actionable, safe, real-world measures to save water.',
      desc_hi: 'विद्यार्थी सुरक्षित, व्यावहारिक और वास्तविक जीवन में लागू करने योग्य समाधान प्रस्तावित करता है।'
    },
    {
      id: 'lo-water-06',
      code: 'LO-WATER-06',
      day: 3,
      en: 'Communicate & Collaborate',
      hi: 'स्पष्ट संवाद और सहभागिता',
      desc_en: 'Student communicates rationale clearly in Hindi or English and engages constructively.',
      desc_hi: 'विद्यार्थी हिंदी या अंग्रेजी में स्पष्ट तर्क प्रस्तुत करता है और रचनात्मक सहयोग करता है।'
    }
  ];

  for (const lo of objectives) {
    dbManager.run(
      `INSERT INTO learning_objectives (id, code, project_id, day_number, title_en, title_hi, description_en, description_hi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [lo.id, lo.code, projectId, lo.day, lo.en, lo.hi, lo.desc_en, lo.desc_hi]
    );
  }

  // Pre-seed 1 sample submission and assessment for Student 1 Day 1 so dashboard has immediate live data
  const sub1Id = 'sub-water-stu1-d1';
  dbManager.run(
    `INSERT INTO submissions (id, project_id, activity_id, day_number, student_id, class_id, submission_type, answers_json, submitted_at, sync_status, client_idempotency_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sub1Id,
      projectId,
      act1Id,
      1,
      'usr-student-01',
      class1Id,
      'individual',
      JSON.stringify({
        water_uses: 'पीने के लिए और खाना बनाने के लिए (Drinking and Cooking)',
        observed_waste: 'स्कूल के मैदान में एक नल आधा खुला था और लगातार पानी बह रहा था।',
        initial_methods: '1. नल को हमेशा कसकर बंद करें। 2. अगर नल खराब हो तो शिक्षक जी को तुरंत बताएं।'
      }),
      new Date().toISOString(),
      'synced',
      'idemp-stu1-d1-seed'
    ]
  );

  // Pre-seed assessment for Student 1 Day 1
  dbManager.run(
    `INSERT INTO assessments (id, submission_id, student_id, evaluator_teacher_id, objective_id, rubric, constructive_comment, evaluated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'asm-01',
      sub1Id,
      'usr-student-01',
      'usr-teacher-01',
      'lo-water-01',
      'achieved',
      'शानदार अवलोकन! आपने पानी के उपयोग और इसे बचाने के तरीकों को बहुत अच्छे से समझाया। (Excellent observation and explanation!)',
      new Date().toISOString()
    ]
  );

  console.log('Database seeded successfully with realistic school and project data!');
}

// Allow direct execution
if (process.argv[1]?.includes('seed.ts')) {
  dbManager.init();
  seedDatabase();
  dbManager.close();
  console.log('Seed execution completed.');
}
