// Seed script – populates the database with realistic test data
// Run: npm run seed
const bcrypt = require('bcryptjs');
const { sequelize, User, Consent, UsageLog } = require('./models');
require('dotenv').config();

const COURSES = ['TDT4242', 'TDT4140', 'IT2810', 'TMA4100', 'TDT4120'];
const AI_TOOLS = ['LLM', 'Image Generation', 'Code Assistant'];
const TASK_TYPES = ['Debugging', 'Writing', 'Research'];

const CONTEXT_SAMPLES = {
  Debugging: [
    'Used ChatGPT to debug a NullPointerException in my Spring Boot controller',
    'Asked Copilot to help trace a race condition in async code',
    'Used Claude to diagnose a CSS layout issue with flexbox',
    'Debugged a failing SQL query with GPT-4 assistance',
    'Asked LLM to explain a stack-overflow error in recursive function',
  ],
  Writing: [
    'Generated an outline for my term paper on distributed systems',
    'Used LLM to proofread and improve my lab report introduction',
    'Asked AI to suggest better wording for my abstract',
    'Used GPT to draft documentation for my REST API endpoints',
    'Generated commit message suggestions for recent changes',
  ],
  Research: [
    'Searched for related work on transformer architectures',
    'Asked LLM to summarise a paper on graph neural networks',
    'Used AI to compare sorting algorithm complexities',
    'Explored trade-offs between SQL and NoSQL with AI assistance',
    'Asked for an overview of OAuth 2.0 grant types',
  ],
};

// Generate a random date within the last N days
function randomDate(daysBack) {
  const now = Date.now();
  const offset = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - offset);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  console.log('Syncing database…');
  await sequelize.sync({ force: true }); // drops & recreates all tables

  // --- Users ---
  console.log('Creating users…');
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await User.bulkCreate([
    { email: 'alice@ntnu.no', password_hash: passwordHash, role: 'student', created_at: randomDate(90) },
    { email: 'bob@ntnu.no', password_hash: passwordHash, role: 'student', created_at: randomDate(90) },
    { email: 'carol@ntnu.no', password_hash: passwordHash, role: 'student', created_at: randomDate(60) },
    { email: 'dave@ntnu.no', password_hash: passwordHash, role: 'student', created_at: randomDate(45) },
    { email: 'eve@ntnu.no', password_hash: passwordHash, role: 'student', created_at: randomDate(30) },
    { email: 'admin@ntnu.no', password_hash: passwordHash, role: 'admin', created_at: randomDate(120) },
  ]);

  console.log(`  Created ${users.length} users (password for all: password123)`);

  // --- Consents ---
  console.log('Creating consents…');
  const consents = [];
  for (const user of users) {
    consents.push({
      user_id: user.id,
      consent_version: '1.0',
      consented_at: new Date(new Date(user.created_at).getTime() + 60000), // 1 min after account creation
      ip: `192.168.1.${randomInt(10, 250)}`,
    });
  }
  await Consent.bulkCreate(consents);
  console.log(`  Created ${consents.length} consent records`);

  // --- Usage Logs ---
  console.log('Creating usage logs…');
  const logs = [];

  // Generate 15-40 logs per student, spread over the last 60 days
  for (const user of users.filter((u) => u.role === 'student')) {
    const count = randomInt(15, 40);
    for (let i = 0; i < count; i++) {
      const taskType = pick(TASK_TYPES);
      const aiTool = pick(AI_TOOLS);
      const courseCode = pick(COURSES);
      const addContext = Math.random() > 0.3; // 70 % chance of context
      const addTokens = Math.random() > 0.2; // 80 % chance of token count

      logs.push({
        user_id: user.id,
        course_code: courseCode,
        task_type: taskType,
        ai_tool: aiTool,
        context_text: addContext ? pick(CONTEXT_SAMPLES[taskType]) : null,
        tokens: addTokens ? randomInt(50, 4000) : null,
        created_at: randomDate(60),
      });
    }
  }

  await UsageLog.bulkCreate(logs);
  console.log(`  Created ${logs.length} usage log entries`);

  // --- Summary ---
  console.log('\n--- Seed Complete ---');
  console.log('Test accounts (all use password: password123):');
  console.log('  Students: alice@ntnu.no, bob@ntnu.no, carol@ntnu.no, dave@ntnu.no, eve@ntnu.no');
  console.log('  Admin:    admin@ntnu.no');
  console.log('');

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
