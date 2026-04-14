// SP2-02 — Prompt templates for AWS Cloud Practitioner (CLF-C02) question generation
// Aligned to the official CLF-C02 Exam Guide (docs.aws.amazon.com/pdfs/aws-certification/latest/cloud-practitioner-02/)
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

// ─── Official CLF-C02 In-Scope Services (from AWS Exam Guide) ───
// ONLY these services may appear in questions or as answer options.
// Any service NOT on this list is out of scope and must NEVER be used.
export const IN_SCOPE_SERVICES_TEXT = `
ALLOWED AWS SERVICES (CLF-C02 In-Scope — official exam guide):

Analytics: Amazon Athena, Amazon EMR, AWS Glue, Amazon Kinesis, Amazon OpenSearch Service, Amazon QuickSight, Amazon Redshift
Application Integration: Amazon EventBridge, Amazon SNS, Amazon SQS, AWS Step Functions
Business Applications: Amazon Connect, Amazon SES
Cloud Financial Management: AWS Budgets, AWS Cost and Usage Reports, AWS Cost Explorer, AWS Marketplace
Compute: AWS Batch, Amazon EC2, AWS Elastic Beanstalk, Amazon Lightsail, AWS Outposts
Containers: Amazon ECR, Amazon ECS, Amazon EKS
Customer Enablement: AWS Support
Database: Amazon Aurora, Amazon DocumentDB, Amazon DynamoDB, Amazon ElastiCache, Amazon Neptune, Amazon RDS
Developer Tools: AWS CLI, AWS CodeBuild, AWS CodePipeline, AWS X-Ray
End User Computing: Amazon AppStream 2.0, Amazon WorkSpaces, Amazon WorkSpaces Secure Browser
Frontend Web and Mobile: AWS Amplify, AWS AppSync
IoT: AWS IoT Core
Machine Learning: Amazon Comprehend, Amazon Kendra, Amazon Lex, Amazon Polly, Amazon Q, Amazon Rekognition, Amazon SageMaker AI, Amazon Textract, Amazon Transcribe, Amazon Translate
Management and Governance: AWS Auto Scaling, AWS CloudFormation, AWS CloudTrail, Amazon CloudWatch, AWS Compute Optimizer, AWS Config, AWS Control Tower, AWS Health Dashboard, AWS License Manager, AWS Management Console, AWS Organizations, AWS Service Catalog, Service Quotas, AWS Systems Manager, AWS Trusted Advisor, AWS Well-Architected Tool
Migration and Transfer: AWS Application Discovery Service, AWS Application Migration Service, AWS DMS, Migration Evaluator, AWS Migration Hub, AWS SCT, AWS Snow Family
Networking and Content Delivery: Amazon API Gateway, Amazon CloudFront, AWS Direct Connect, AWS Global Accelerator, AWS PrivateLink, Amazon Route 53, AWS Transit Gateway, Amazon VPC, AWS VPN, AWS Site-to-Site VPN, AWS Client VPN
Security, Identity, and Compliance: AWS Artifact, AWS Audit Manager, AWS Certificate Manager (ACM), AWS CloudHSM, Amazon Cognito, Amazon Detective, AWS Directory Service, AWS Firewall Manager, Amazon GuardDuty, AWS IAM, AWS IAM Identity Center, Amazon Inspector, AWS KMS, Amazon Macie, AWS RAM, AWS Secrets Manager, AWS Security Hub, AWS Shield, AWS WAF
Serverless: AWS Fargate, AWS Lambda
Storage: AWS Backup, Amazon EBS, Amazon EFS, AWS Elastic Disaster Recovery, Amazon FSx, Amazon S3, Amazon S3 Glacier, AWS Storage Gateway

BANNED SERVICES (out of scope — do NOT use in questions or options):
Amazon MQ, Amazon MSK, Amazon AppFlow, AWS Clean Rooms, AWS Data Exchange, Amazon DataZone, Amazon Timestream, AWS AppFabric, Amazon SWF, Amazon WorkDocs, Amazon WorkMail, AWS App Runner, AWS Copilot, AWS Wavelength, AWS Activate, AWS IQ, AWS Managed Services, AWS Billing Conductor, Amazon Keyspaces, Amazon MemoryDB, AWS AppConfig, AWS Application Composer, AWS CodeArtifact, AWS CodeDeploy, Amazon CodeGuru, AWS CloudShell, AWS Device Farm, Amazon GameLift, Amazon Lumberyard, AWS IoT Device Defender, AWS IoT Greengrass, Amazon Monitron, Amazon Fraud Detector, Amazon Lookout for Metrics, Amazon Mechanical Turk, AWS Panorama, Amazon Personalize, AWS Chatbot, Amazon Data Lifecycle Manager, Amazon Elastic Transcoder, AWS Launch Wizard, all AWS Elemental services, Amazon IVS, AWS Migration Hub Refactor Spaces, AWS Transfer Family, AWS Cloud Map, AWS Network Access Analyzer, AWS Ground Station, Amazon VPC Lattice, Amazon Cloud Directory, AWS Network Firewall, AWS RoboMaker, Amazon FSx for Lustre
`;

const DIFFICULTY_INSTRUCTIONS: Record<Difficulty, string> = {
  easy: `Generate EASY study-mode questions. These test direct knowledge recall — the candidate should be able to answer by knowing what a service does.
Format: "What is [service]?", "Which service does [function]?", "What does [concept] mean?"
Distractors must be clearly different in-scope services. A beginner who studied the material should get these right.
Do NOT write scenario-based questions at this level.`,

  medium: `Generate MEDIUM difficulty questions. These mix direct knowledge with light use-case matching.
Format: "A company needs [requirement]. Which AWS service should they use?" or "Which of the following is a benefit of [concept]?"
Distractors must be plausible in-scope services from the same category (e.g., if the answer is a database service, distractors should be other database or storage services).
Each distractor must be wrong for a specific, explainable reason — not just a random service.`,

  hard: `Generate HARD exam-style questions that closely mimic real CLF-C02 exam questions. These must be scenario-based with realistic business context.
Format: "A company is [scenario with 2-3 constraints]. Which AWS service meets these requirements?"
All 4 options must be real in-scope services that solve related but different problems. The candidate must understand the distinctions between similar services to answer correctly.
Include questions that test understanding of the Shared Responsibility Model, Well-Architected Framework pillars, and pricing/cost scenarios — not just service identification.`,
};

// ─── Domain Topics aligned to official CLF-C02 Task Statements ───
const DOMAIN_TOPICS: Record<Domain, string> = {
  "Cloud Concepts": `This domain covers 24% of the exam. Generate questions aligned to these EXACT task statements from the official exam guide:

Task 1.1 — Define the benefits of the AWS Cloud:
- Value proposition, global infrastructure benefits (speed of deployment, global reach), high availability, elasticity, agility

Task 1.2 — Identify design principles of the AWS Cloud:
- AWS Well-Architected Framework pillars (operational excellence, security, reliability, performance efficiency, cost optimization, sustainability)
- Differences between the pillars

Task 1.3 — Understand migration benefits and strategies:
- Cloud Adoption Framework (AWS CAF) components (reduced business risk, improved ESG, increased revenue, operational efficiency)
- Migration strategies (database replication, AWS Snowball)

Task 1.4 — Understand cloud economics:
- Fixed costs vs. variable costs, on-premises cost comparison, licensing strategies (BYOL vs. included), rightsizing, automation benefits, economies of scale

IMPORTANT: Spread questions across ALL 4 task statements. Do NOT cluster on IaaS/PaaS/SaaS definitions — these are only a small part of Task 1.1. The exam tests migration strategy, Well-Architected pillars, and cloud economics equally.`,

  "Security and Compliance": `This domain covers 30% of the exam (the largest). Generate questions aligned to these EXACT task statements:

Task 2.1 — Understand the AWS Shared Responsibility Model:
- Customer vs. AWS responsibilities, how responsibilities shift by service (RDS vs. Lambda vs. EC2)

Task 2.2 — Understand security, governance, and compliance:
- AWS Artifact for compliance info, geographic/industry compliance needs
- Securing resources: Amazon Inspector, AWS Security Hub, Amazon GuardDuty, AWS Shield
- Encryption options: at rest, in transit
- Governance: CloudWatch monitoring, CloudTrail auditing, AWS Audit Manager, AWS Config, access reports

Task 2.3 — Identify access management capabilities:
- IAM (users, groups, roles, policies), root user protection, least privilege, IAM Identity Center
- Access keys, password policies, credential storage (Secrets Manager, Systems Manager)
- Authentication: MFA, IAM Identity Center, cross-account roles, federated identity

Task 2.4 — Identify security components and resources:
- AWS WAF, AWS Firewall Manager, AWS Shield, Amazon GuardDuty
- AWS Marketplace third-party security products
- AWS Knowledge Center, Security Center, Security Blog
- AWS Trusted Advisor for security issues

In-scope security services: AWS Artifact, AWS Audit Manager, ACM, AWS CloudHSM, Amazon Cognito, Amazon Detective, AWS Directory Service, AWS Firewall Manager, Amazon GuardDuty, IAM, IAM Identity Center, Amazon Inspector, AWS KMS, Amazon Macie, AWS RAM, AWS Secrets Manager, AWS Security Hub, AWS Shield, AWS WAF`,

  "Cloud Technology and Services": `This domain covers 34% of the exam (the largest by weight). Generate questions aligned to these EXACT task statements:

Task 3.1 — Methods of deploying and operating in AWS:
- Programmatic access (APIs, SDKs, CLI), AWS Management Console, Infrastructure as Code (IaC)
- One-time operations vs. repeatable processes, deployment models (cloud, hybrid, on-premises)

Task 3.2 — AWS global infrastructure:
- Regions, Availability Zones, edge locations, high availability via multiple AZs
- AZs do not share single points of failure, when to use multiple Regions (DR, low latency, data sovereignty)

Task 3.3 — Compute services:
- EC2 instance types (compute optimized, storage optimized), containers (ECS, EKS), serverless (Fargate, Lambda), auto scaling, load balancers
- In-scope: AWS Batch, Amazon EC2, AWS Elastic Beanstalk, Amazon Lightsail, AWS Outposts

Task 3.4 — Database services:
- EC2-hosted vs. managed databases, relational (RDS, Aurora), NoSQL (DynamoDB), memory-based (ElastiCache), migration tools (DMS, SCT)
- In-scope: Aurora, DocumentDB, DynamoDB, ElastiCache, Neptune, RDS

Task 3.5 — Network services:
- VPC components (subnets, gateways), VPC security (NACLs, security groups, Inspector), Route 53 purpose, connectivity (VPN, Direct Connect)
- In-scope: API Gateway, CloudFront, Direct Connect, Global Accelerator, PrivateLink, Route 53, Transit Gateway, VPC, VPN

Task 3.6 — Storage services:
- Object storage (S3, S3 storage classes), block storage (EBS, instance store), file services (EFS, FSx), cached file systems (Storage Gateway), lifecycle policies, AWS Backup
- In-scope: AWS Backup, EBS, EFS, Elastic Disaster Recovery, FSx, S3, S3 Glacier, Storage Gateway

Task 3.7 — AI/ML and analytics services:
- AI/ML: SageMaker AI, Lex, Kendra, Comprehend, Rekognition, Polly, Textract, Transcribe, Translate, Amazon Q
- Analytics: Athena, Kinesis, Glue, QuickSight, EMR, OpenSearch, Redshift

Task 3.8 — Other in-scope service categories:
- Application integration: EventBridge, SNS, SQS, Step Functions
- Business apps: Amazon Connect, Amazon SES
- Developer tools: CLI, CodeBuild, CodePipeline, X-Ray
- End user computing: AppStream 2.0, WorkSpaces, WorkSpaces Secure Browser
- Frontend: Amplify, AppSync
- IoT: IoT Core

IMPORTANT: Spread questions across ALL 8 task statements. Do not over-index on any single service.`,

  "Billing, Pricing, and Support": `This domain covers 12% of the exam. Generate questions aligned to these EXACT task statements:

Task 4.1 — Compare AWS pricing models:
- Compute purchasing: On-Demand, Reserved Instances, Spot Instances, Savings Plans, Dedicated Hosts, Dedicated Instances, Capacity Reservations
- Reserved Instance flexibility and behavior in AWS Organizations
- Data transfer costs (between Regions, within a Region), storage pricing options and tiers

Task 4.2 — Billing, budget, and cost management resources:
- AWS Budgets, AWS Cost Explorer, AWS Pricing Calculator
- AWS Organizations consolidated billing, cost allocation tags, AWS Cost and Usage Report

Task 4.3 — Technical resources and AWS Support options:
- AWS whitepapers, blogs, documentation, AWS Prescriptive Guidance, Knowledge Center, re:Post
- Support plans: Basic, Developer, Business, Enterprise On-Ramp, Enterprise
- AWS Trusted Advisor, Health Dashboard, Health API
- AWS Trust and Safety team (abuse reporting)
- AWS Partners, AWS Marketplace (cost management, governance, entitlement)
- AWS Professional Services, Solutions Architects`,
};

export function buildQuestionPrompt(
  domain: Domain,
  difficulty: Difficulty,
  count: number,
  topic?: string,
): string {
  const topicInstruction = topic
    ? `\nSub-topic focus: ALL ${count} questions must be specifically about ${topic}. Do not generate questions about other sub-topics within this domain.`
    : "";

  return `You are an expert AWS certification instructor creating practice questions for the AWS Certified Cloud Practitioner (CLF-C02) exam.

CRITICAL CONSTRAINT — EXAM SCOPE:
You must ONLY generate questions about services, concepts, and topics that appear on the official CLF-C02 exam.
${IN_SCOPE_SERVICES_TEXT}
If a service is not in the ALLOWED list above, do NOT mention it in any question or answer option. If a service is in the BANNED list, do NOT use it at all. This is non-negotiable.

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
    "explanation": "A 1-2 sentence explanation of why the correct answer is right and why the most tempting distractor is wrong."
  }
]

Rules:
- Return ONLY the JSON array, no markdown fences, no extra text
- Every question must be factually accurate for the current CLF-C02 exam
- Each question must have exactly 4 options with keys A, B, C, D
- correctOption must be one of A, B, C, D
- Explanations must explain why the correct answer is right AND briefly why the closest distractor is wrong
- Vary the correct answer position evenly across A, B, C, D — do not favor any letter
- Do not repeat questions within this batch
- Do not generate generic definition questions where multiple answers could seem correct (e.g., avoid "Which is an example of SaaS?" when the options are ambiguous)
- Each distractor must be a real in-scope AWS service or concept — never use made-up names
- Every question must test knowledge that would help pass the CLF-C02 exam — if a question would not appear on the real exam, do not include it
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
