// One-off script: generate 2 questions per service group across all CLF-C02 domains
// Usage: npx tsx scripts/generate-grouped-questions.ts

import Anthropic from "@anthropic-ai/sdk";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Pool } from "pg";
import { z } from "zod/v4";

import { IN_SCOPE_SERVICES_TEXT } from "./prompts/question-prompts";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const anthropic = new Anthropic();
const MODEL = "claude-sonnet-4-6";

const QuestionSchema = z.object({
  questionText: z.string().min(10),
  group: z.string(),
  options: z
    .array(z.object({ key: z.enum(["A", "B", "C", "D"]), text: z.string().min(1) }))
    .length(4),
  correctOption: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(10),
});

interface Group {
  name: string;
  services: string;
}

interface DomainBatch {
  domain: string;
  difficulty: "easy" | "medium" | "hard";
  groups: Group[];
}

// ─── Service groups by domain ───

const BATCHES: DomainBatch[] = [
  // ── Cloud Concepts (no specific services, concept-based) ──
  {
    domain: "Cloud Concepts",
    difficulty: "medium",
    groups: [
      { name: "Cloud Benefits", services: "Value proposition, global reach, speed of deployment, high availability, elasticity, agility" },
      { name: "Well-Architected Framework", services: "6 pillars: operational excellence, security, reliability, performance efficiency, cost optimization, sustainability" },
      { name: "Migration Strategies", services: "AWS Cloud Adoption Framework (CAF), migration strategies, database replication, AWS Snowball" },
      { name: "Cloud Economics", services: "Fixed vs variable costs, on-premises comparison, BYOL licensing, rightsizing, automation, economies of scale" },
      { name: "Cloud Models", services: "IaaS, PaaS, SaaS, public/private/hybrid cloud, deployment models" },
    ],
  },

  // ── Security and Compliance ──
  {
    domain: "Security and Compliance",
    difficulty: "medium",
    groups: [
      { name: "Shared Responsibility Model", services: "AWS vs customer responsibilities, how responsibilities shift by service (EC2 vs RDS vs Lambda)" },
      { name: "IAM Core", services: "IAM users, groups, roles, policies, root user, least privilege principle" },
      { name: "IAM Identity Center & Federation", services: "IAM Identity Center (SSO), federated identity, cross-account roles" },
      { name: "Credentials & MFA", services: "MFA, access keys, password policies, AWS Secrets Manager, AWS Systems Manager" },
      { name: "Threat Detection", services: "Amazon GuardDuty, Amazon Inspector, Amazon Detective" },
      { name: "Network Protection", services: "AWS Shield, AWS WAF, AWS Firewall Manager" },
      { name: "Encryption", services: "AWS KMS, AWS CloudHSM, AWS Certificate Manager (ACM), encryption at rest, encryption in transit" },
      { name: "Governance & Auditing", services: "AWS CloudTrail, AWS Config, AWS Audit Manager" },
      { name: "Data Protection & Posture", services: "Amazon Macie, AWS Security Hub" },
      { name: "Identity Services", services: "Amazon Cognito, AWS Directory Service" },
      { name: "Compliance", services: "AWS Artifact, AWS RAM, compliance programs" },
      { name: "Security Resources", services: "AWS Trusted Advisor (security checks), AWS Knowledge Center, AWS Security Blog, AWS Marketplace third-party security" },
    ],
  },

  // ── Cloud Technology and Services ──
  // Compute
  {
    domain: "Cloud Technology and Services",
    difficulty: "easy",
    groups: [
      { name: "EC2", services: "Amazon EC2, instance types (compute optimized, storage optimized, general purpose), auto scaling, Elastic Load Balancing" },
      { name: "Serverless Compute", services: "AWS Lambda, AWS Fargate" },
      { name: "Containers", services: "Amazon ECS, Amazon EKS, Amazon ECR" },
      { name: "Other Compute", services: "AWS Elastic Beanstalk, Amazon Lightsail, AWS Batch, AWS Outposts" },
    ],
  },
  // Storage
  {
    domain: "Cloud Technology and Services",
    difficulty: "easy",
    groups: [
      { name: "S3", services: "Amazon S3, S3 storage classes, S3 Glacier, lifecycle policies" },
      { name: "Block Storage", services: "Amazon EBS, instance store, volume types" },
      { name: "File Storage", services: "Amazon EFS, Amazon FSx" },
      { name: "Storage Management", services: "AWS Storage Gateway, AWS Backup, AWS Elastic Disaster Recovery" },
    ],
  },
  // Database
  {
    domain: "Cloud Technology and Services",
    difficulty: "medium",
    groups: [
      { name: "Relational Databases", services: "Amazon RDS, Amazon Aurora, EC2-hosted vs managed databases" },
      { name: "DynamoDB", services: "Amazon DynamoDB, NoSQL concepts, key-value and document database" },
      { name: "In-Memory & Purpose-Built", services: "Amazon ElastiCache, Amazon Neptune, Amazon DocumentDB" },
      { name: "Database Migration", services: "AWS DMS, AWS Schema Conversion Tool (SCT)" },
    ],
  },
  // Networking
  {
    domain: "Cloud Technology and Services",
    difficulty: "medium",
    groups: [
      { name: "VPC", services: "Amazon VPC, subnets, internet gateways, NAT gateways, NACLs, security groups" },
      { name: "DNS & Content Delivery", services: "Amazon Route 53, Amazon CloudFront, AWS Global Accelerator" },
      { name: "Connectivity", services: "AWS Direct Connect, AWS VPN, AWS Site-to-Site VPN, AWS Client VPN" },
      { name: "Network Services", services: "Amazon API Gateway, AWS PrivateLink, AWS Transit Gateway" },
    ],
  },
  // AI/ML
  {
    domain: "Cloud Technology and Services",
    difficulty: "easy",
    groups: [
      { name: "ML Platform & Vision", services: "Amazon SageMaker AI, Amazon Rekognition, Amazon Comprehend" },
      { name: "Language & Speech", services: "Amazon Lex, Amazon Polly, Amazon Transcribe, Amazon Translate" },
      { name: "Document & Search AI", services: "Amazon Kendra, Amazon Textract, Amazon Q" },
    ],
  },
  // Analytics
  {
    domain: "Cloud Technology and Services",
    difficulty: "medium",
    groups: [
      { name: "Query & Warehouse", services: "Amazon Athena, Amazon Redshift" },
      { name: "Streaming & ETL", services: "Amazon Kinesis, AWS Glue" },
      { name: "Analytics Services", services: "Amazon EMR, Amazon OpenSearch Service, Amazon QuickSight" },
    ],
  },
  // Management & Governance
  {
    domain: "Cloud Technology and Services",
    difficulty: "medium",
    groups: [
      { name: "IaC & Deployment", services: "AWS CloudFormation, AWS Management Console, AWS CLI, APIs, SDKs" },
      { name: "Monitoring", services: "Amazon CloudWatch, AWS CloudTrail, AWS X-Ray" },
      { name: "Scaling & Optimization", services: "AWS Auto Scaling, AWS Compute Optimizer" },
      { name: "Account Governance", services: "AWS Organizations, AWS Control Tower, AWS Service Catalog" },
      { name: "Operational Tools", services: "AWS Systems Manager, AWS Config, AWS Trusted Advisor, AWS Health Dashboard" },
      { name: "Other Management", services: "AWS License Manager, Service Quotas, AWS Well-Architected Tool" },
    ],
  },
  // Migration
  {
    domain: "Cloud Technology and Services",
    difficulty: "medium",
    groups: [
      { name: "Snow Family", services: "AWS Snow Family (Snowcone, Snowball, Snowmobile)" },
      { name: "Migration Tools", services: "AWS Application Discovery Service, AWS Migration Hub, AWS Application Migration Service, Migration Evaluator" },
    ],
  },
  // Application Integration & Other
  {
    domain: "Cloud Technology and Services",
    difficulty: "medium",
    groups: [
      { name: "Messaging", services: "Amazon SQS, Amazon SNS" },
      { name: "Event & Workflow", services: "Amazon EventBridge, AWS Step Functions" },
      { name: "Business Apps", services: "Amazon Connect, Amazon SES" },
      { name: "Developer Tools", services: "AWS CodeBuild, AWS CodePipeline, AWS X-Ray" },
      { name: "End User Computing", services: "Amazon AppStream 2.0, Amazon WorkSpaces, Amazon WorkSpaces Secure Browser" },
      { name: "Frontend & Mobile", services: "AWS Amplify, AWS AppSync" },
      { name: "IoT", services: "AWS IoT Core" },
    ],
  },

  // ── Billing, Pricing, and Support ──
  {
    domain: "Billing, Pricing, and Support",
    difficulty: "medium",
    groups: [
      { name: "EC2 Pricing Models", services: "On-Demand, Reserved Instances, Spot Instances, Savings Plans, Dedicated Hosts, Dedicated Instances, Capacity Reservations" },
      { name: "Data Transfer & Storage Pricing", services: "Data transfer costs between Regions, within Regions, storage pricing tiers" },
      { name: "Cost Management Tools", services: "AWS Budgets, AWS Cost Explorer, AWS Cost and Usage Reports, cost allocation tags" },
      { name: "Pricing & Billing", services: "AWS Pricing Calculator, AWS Organizations consolidated billing" },
      { name: "Support Plans", services: "Basic, Developer, Business, Enterprise On-Ramp, Enterprise support plans" },
      { name: "Technical Resources", services: "AWS Marketplace, AWS Partners, AWS Professional Services, Solutions Architects, AWS re:Post, AWS Knowledge Center, AWS Prescriptive Guidance" },
      { name: "Monitoring & Trust", services: "AWS Trusted Advisor, AWS Health Dashboard, AWS Health API, AWS Trust and Safety team" },
    ],
  },
];

async function generateForBatch(batch: DomainBatch): Promise<number> {
  const groupList = batch.groups
    .map((g, i) => `  Group ${i + 1} — "${g.name}": ${g.services}`)
    .join("\n");

  const totalQuestions = batch.groups.length * 2;

  const prompt = `You are an expert AWS certification instructor creating practice questions for the AWS Certified Cloud Practitioner (CLF-C02) exam.

CRITICAL CONSTRAINT — EXAM SCOPE:
${IN_SCOPE_SERVICES_TEXT}
If a service is not in the ALLOWED list above, do NOT mention it in any question or answer option.

Difficulty: ${batch.difficulty.toUpperCase()}
${batch.difficulty === "easy" ? "Direct knowledge recall questions. No scenarios. A beginner who studied should get these right." : ""}
${batch.difficulty === "medium" ? "Mix direct knowledge with light use-case matching. Distractors must be plausible in-scope services from the same category." : ""}
${batch.difficulty === "hard" ? "Scenario-based with 2-3 constraints. All 4 options must be real in-scope services solving related problems." : ""}

Domain: ${batch.domain}

Generate EXACTLY 2 questions for EACH of the following ${batch.groups.length} groups (${totalQuestions} questions total):
${groupList}

Return a JSON array with this exact structure:
[
  {
    "group": "Group name exactly as listed above",
    "questionText": "The full question text",
    "options": [
      { "key": "A", "text": "First option" },
      { "key": "B", "text": "Second option" },
      { "key": "C", "text": "Third option" },
      { "key": "D", "text": "Fourth option" }
    ],
    "correctOption": "B",
    "explanation": "Why the correct answer is right and why the closest distractor is wrong."
  }
]

Rules:
- Return ONLY the JSON array, no markdown fences, no extra text
- EXACTLY 2 questions per group, ${totalQuestions} total
- The "group" field must match the group name exactly
- Every question must be factually accurate for CLF-C02
- Each question must have exactly 4 options (A, B, C, D), 1 correct
- Vary correct answer position evenly across A, B, C, D
- Each distractor must be a real in-scope service or concept
- Explanations: why correct + why closest distractor is wrong
- Do not repeat questions
- All content in English`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 16384,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`No JSON found for ${batch.domain}`);

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = z.array(QuestionSchema).parse(parsed);

  let inserted = 0;
  for (const q of validated) {
    await prisma.question.create({
      data: {
        domain: batch.domain,
        difficulty: batch.difficulty,
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
      },
    });
    inserted++;
  }
  return inserted;
}

async function main() {
  console.log("=== CLF-C02 Grouped Question Generator ===\n");

  const totalGroups = BATCHES.reduce((sum, b) => sum + b.groups.length, 0);
  console.log(`${BATCHES.length} batches, ${totalGroups} groups, target: ${totalGroups * 2} questions\n`);

  let totalInserted = 0;

  for (let i = 0; i < BATCHES.length; i++) {
    const batch = BATCHES[i];
    const label = `[${i + 1}/${BATCHES.length}] ${batch.domain} (${batch.difficulty}) — ${batch.groups.length} groups`;
    console.log(`${label}...`);

    try {
      const count = await generateForBatch(batch);
      totalInserted += count;
      console.log(`  ✓ ${count} questions inserted`);
    } catch (error) {
      console.error(`  ✗ Failed:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`\n=== Done: ${totalInserted} questions inserted ===`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error("Fatal:", error);
  process.exit(1);
});
