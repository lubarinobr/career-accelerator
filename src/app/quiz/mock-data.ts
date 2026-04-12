// Mock data for quiz flow development (pre-SYNC-5)
// Replace with real API calls once Dev 2 delivers SP2-04 and SP2-05

import type { QuizQuestion, AnswerResponse } from "@/types";

const MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: "mock-1",
    domain: "Cloud Concepts",
    difficulty: "easy",
    questionText:
      "Which of the following best describes cloud computing?",
    options: [
      {
        key: "A",
        text: "On-demand delivery of IT resources over the internet with pay-as-you-go pricing",
      },
      {
        key: "B",
        text: "Buying and maintaining physical servers in your office",
      },
      {
        key: "C",
        text: "Using only open-source software for all IT needs",
      },
      {
        key: "D",
        text: "Storing all data on local hard drives",
      },
    ],
  },
  {
    id: "mock-2",
    domain: "Security and Compliance",
    difficulty: "medium",
    questionText:
      "Which AWS service is primarily used for identity and access management?",
    options: [
      { key: "A", text: "Amazon S3" },
      { key: "B", text: "AWS IAM" },
      { key: "C", text: "Amazon EC2" },
      { key: "D", text: "AWS Lambda" },
    ],
  },
  {
    id: "mock-3",
    domain: "Cloud Technology and Services",
    difficulty: "medium",
    questionText:
      "What is the purpose of Amazon S3?",
    options: [
      { key: "A", text: "Running virtual servers" },
      { key: "B", text: "Object storage service" },
      { key: "C", text: "Managing DNS records" },
      { key: "D", text: "Sending email notifications" },
    ],
  },
  {
    id: "mock-4",
    domain: "Billing, Pricing, and Support",
    difficulty: "easy",
    questionText:
      "Which AWS pricing model allows you to pay only for what you use with no upfront costs?",
    options: [
      { key: "A", text: "Reserved Instances" },
      { key: "B", text: "Dedicated Hosts" },
      { key: "C", text: "On-Demand pricing" },
      { key: "D", text: "Spot Instances" },
    ],
  },
  {
    id: "mock-5",
    domain: "Cloud Concepts",
    difficulty: "hard",
    questionText:
      "Which of the following is a benefit of the AWS Cloud that relates to the ability to quickly provision resources as needed?",
    options: [
      { key: "A", text: "Economy of scale" },
      { key: "B", text: "Elasticity" },
      { key: "C", text: "High availability" },
      { key: "D", text: "Fault tolerance" },
    ],
  },
];

// Mock correct answers (simulates the server knowing the correct option)
const MOCK_ANSWERS: Record<string, { correctOption: string; explanation: string }> = {
  "mock-1": {
    correctOption: "A",
    explanation:
      "Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing. Instead of buying and maintaining physical data centers and servers, you can access technology services on an as-needed basis.",
  },
  "mock-2": {
    correctOption: "B",
    explanation:
      "AWS Identity and Access Management (IAM) enables you to manage access to AWS services and resources securely. You can create and manage AWS users and groups, and use permissions to allow and deny their access.",
  },
  "mock-3": {
    correctOption: "B",
    explanation:
      "Amazon Simple Storage Service (Amazon S3) is an object storage service offering scalability, data availability, security, and performance. It is designed to store and retrieve any amount of data from anywhere.",
  },
  "mock-4": {
    correctOption: "C",
    explanation:
      "On-Demand pricing lets you pay for compute capacity by the hour or second with no long-term commitments or upfront payments. This is ideal for applications with short-term, spiky, or unpredictable workloads.",
  },
  "mock-5": {
    correctOption: "B",
    explanation:
      "Elasticity is the ability to acquire resources as you need them and release resources when you no longer need them. In the cloud, you want to do this automatically, scaling up and down as demand changes.",
  },
};

export async function mockFetchQuestions(): Promise<QuizQuestion[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_QUESTIONS;
}

export async function mockSubmitAnswer(
  questionId: string,
  selectedOption: string
): Promise<AnswerResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  const answer = MOCK_ANSWERS[questionId];
  if (!answer) {
    throw new Error(`Unknown question: ${questionId}`);
  }

  const isCorrect = selectedOption === answer.correctOption;

  return {
    isCorrect,
    correctOption: answer.correctOption,
    selectedOption,
    explanation: answer.explanation,
    aiFeedback: isCorrect
      ? null
      : "Think about the key characteristic that distinguishes this concept from the others. The correct answer focuses on the core definition as described in the AWS documentation.",
  };
}
