// SP2-02 — Prompt templates for AWS Cloud Practitioner (CLF-C02) question generation
// 4 domains x 3 difficulties = 12 prompt variations
// Easy = study-mode (direct knowledge), Medium = mix, Hard = realistic exam-style (scenario-based)

export const DOMAINS = [
  "Cloud Concepts",
  "Security and Compliance",
  "Cloud Technology and Services",
  "Billing, Pricing, and Support",
] as const;

export type Domain = (typeof DOMAINS)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

// Weighted distribution matching CLF-C02 exam (total: 600)
export const DOMAIN_WEIGHTS: Record<Domain, number> = {
  "Cloud Concepts": 144,
  "Security and Compliance": 180,
  "Cloud Technology and Services": 204,
  "Billing, Pricing, and Support": 72,
};

// Per-difficulty split within each domain (roughly equal thirds)
export function getQuestionCount(
  domain: Domain,
  difficulty: Difficulty,
): number {
  const total = DOMAIN_WEIGHTS[domain];
  const third = Math.floor(total / 3);
  // Give any remainder to medium
  if (difficulty === "medium") return total - third * 2;
  return third;
}

const DIFFICULTY_INSTRUCTIONS: Record<Difficulty, string> = {
  easy: `Generate EASY study-mode questions. These should be direct knowledge questions that test basic understanding of AWS concepts. Examples: "What is Amazon S3?", "Which service provides compute capacity in the cloud?". The distractors should be clearly different AWS services or concepts. These questions build vocabulary and confidence for beginners.`,

  medium: `Generate MEDIUM difficulty questions. Mix direct knowledge questions with light scenario-based questions. Some should ask about use cases: "A company needs to store objects in the cloud. Which AWS service should they use?". Distractors should be plausible but distinguishable with basic AWS knowledge.`,

  hard: `Generate HARD exam-style questions. These must closely mimic real AWS CLF-C02 exam questions. Use scenario-based format: "A company is migrating its on-premises infrastructure to AWS. They need a service that provides managed relational databases with automatic backups and multi-AZ deployment. Which service should they choose?". Include plausible distractors that test deep understanding, not just recall. Each wrong option should represent a real AWS service that solves a related but different problem.`,
};

const DOMAIN_TOPICS: Record<Domain, string> = {
  "Cloud Concepts": `Focus on: cloud computing benefits (agility, elasticity, cost savings), cloud deployment models (public, private, hybrid), AWS Well-Architected Framework pillars, cloud value proposition, AWS Cloud Adoption Framework, economies of scale, types of cloud computing (IaaS, PaaS, SaaS), global infrastructure concepts (Regions, Availability Zones, Edge Locations).`,

  "Security and Compliance": `Focus on: AWS Shared Responsibility Model, IAM (users, groups, roles, policies), MFA, AWS security services (GuardDuty, Inspector, Shield, WAF, KMS, CloudTrail, Config, Macie), compliance programs, data protection (encryption at rest/in transit), network security (Security Groups, NACLs, VPC), AWS Artifact, AWS Organizations SCPs.`,

  "Cloud Technology and Services": `Focus on: compute services (EC2, Lambda, ECS, Fargate, Elastic Beanstalk), storage services (S3, EBS, EFS, Glacier), database services (RDS, DynamoDB, Aurora, ElastiCache, Redshift), networking (VPC, CloudFront, Route 53, API Gateway, Direct Connect), management tools (CloudWatch, CloudFormation, Systems Manager), migration services (Snow Family, DMS), analytics services (Athena, Kinesis), application integration (SQS, SNS, Step Functions).`,

  "Billing, Pricing, and Support": `Focus on: AWS pricing models (On-Demand, Reserved, Spot, Savings Plans), free tier, AWS Cost Explorer, AWS Budgets, AWS Cost and Usage Report, Consolidated Billing, AWS Organizations, support plans (Basic, Developer, Business, Enterprise), pricing for key services (EC2, S3, Lambda, data transfer), Total Cost of Ownership (TCO), AWS Pricing Calculator, tags for cost allocation.`,
};

export function buildQuestionPrompt(
  domain: Domain,
  difficulty: Difficulty,
  count: number,
  topic?: string,
): string {
  const topicInstruction = topic
    ? `\nSub-topic focus: ALL ${count} questions must be specifically about ${topic}. Do not generate questions about other sub-topics.`
    : "";

  return `You are an expert AWS certification instructor creating practice questions for the AWS Cloud Practitioner (CLF-C02) exam.

${DIFFICULTY_INSTRUCTIONS[difficulty]}

Domain: ${domain}
${DOMAIN_TOPICS[domain]}${topicInstruction}

Generate exactly ${count} unique multiple-choice questions. Each question must have exactly 4 options (A, B, C, D) with exactly 1 correct answer.

Return a JSON array with this exact structure:
[
  {
    "questionText": "The full question text",
    "options": [
      { "key": "A", "text": "First option" },
      { "key": "B", "text": "Second option" },
      { "key": "C", "text": "Third option" },
      { "key": "D", "text": "Fourth option" }
    ],
    "correctOption": "B",
    "explanation": "A 1-2 sentence explanation of why the correct answer is right."
  }
]

Rules:
- Return ONLY the JSON array, no markdown fences, no extra text
- Every question must be factually accurate for the current CLF-C02 exam
- Each question must have exactly 4 options with keys A, B, C, D
- correctOption must be one of A, B, C, D
- Explanations should be concise (1-2 sentences) in clear English
- Vary the correct answer position — don't always make it A or B
- Do not repeat questions within this batch
- All content must be in English`;
}

export function buildFeedbackPrompt(
  questionText: string,
  options: { key: string; text: string }[],
  userAnswer: string,
  correctAnswer: string,
  explanation: string,
): string {
  const optionsText = options.map((o) => `${o.key}. ${o.text}`).join("\n");

  return `A student is studying for the AWS Cloud Practitioner (CLF-C02) certification. They answered a question incorrectly. Help them understand their mistake.

Question: ${questionText}

Options:
${optionsText}

The student chose: ${userAnswer}
The correct answer is: ${correctAnswer}

Existing explanation: ${explanation}

Given the explanation above, tell the student in simplified English (2-3 short sentences) why their specific choice was wrong and what they should remember. Use simple words and short sentences. Do not repeat the existing explanation — add something new and specific to their wrong choice.`;
}
