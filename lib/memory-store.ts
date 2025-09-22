// Simple in-memory data store for production
// In a real app, you'd use a database like MongoDB, PostgreSQL, etc.

interface AnswerData {
  date: string;
  answers: any[];
  source: string;
  uploaded_at: string;
  total_answers: number;
  high_confidence: number;
}

// In-memory storage
let answersData: Record<string, AnswerData> = {};

export function getAnswersData(): Record<string, AnswerData> {
  return answersData;
}

export function setAnswersData(data: Record<string, AnswerData>): void {
  answersData = data;
}

export function addAnswerData(date: string, data: AnswerData): void {
  answersData[date] = data;
}

export function getAnswerDataByDate(date: string): AnswerData | null {
  return answersData[date] || null;
}

export function getAllDates(): string[] {
  return Object.keys(answersData).sort((a, b) => b.localeCompare(a));
}

export function getAllAnswers(): any[] {
  const allAnswers: any[] = [];
  Object.values(answersData).forEach((dayData) => {
    if (dayData.answers) {
      dayData.answers.forEach((answer) => {
        allAnswers.push({
          ...answer,
          date: dayData.date,
        });
      });
    }
  });
  return allAnswers;
}


