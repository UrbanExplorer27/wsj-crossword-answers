import fs from 'fs/promises'
import path from 'path'
import { 
  getAnswersData, 
  setAnswersData, 
  addAnswerData, 
  getAnswerDataByDate, 
  getAllDates as getMemoryDates,
  getAllAnswers as getMemoryAllAnswers
} from './memory-store'

interface Answer {
  clue: string
  answer: string
  position: string
  confidence: number
}

interface AnswerData {
  date: string
  answers: Answer[]
  scrapedAt?: string
  uploaded_at?: string
  source: string
  total_answers: number
  high_confidence?: number
  screenshot?: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'answers.json')

export async function getTodayAnswers(date: string): Promise<AnswerData | null> {
  try {
    // Try file system first (development)
    const data = await fs.readFile(DATA_FILE, 'utf8')
    const allAnswers = JSON.parse(data)
    
    if (allAnswers[date]) {
      return allAnswers[date]
    }
    
    return null
  } catch (error) {
    // Fallback to memory store (production)
    console.log('File system not available, using memory store')
    return getAnswerDataByDate(date)
  }
}

export async function getAllDates(): Promise<string[]> {
  try {
    // Try file system first (development)
    const data = await fs.readFile(DATA_FILE, 'utf8')
    const allAnswers = JSON.parse(data)
    
    return Object.keys(allAnswers).sort((a, b) => b.localeCompare(a))
  } catch (error) {
    // Fallback to memory store (production)
    console.log('File system not available, using memory store for dates')
    return getMemoryDates()
  }
}

export async function getAllAnswers(): Promise<Record<string, AnswerData>> {
  try {
    // Try file system first (development)
    const data = await fs.readFile(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // Fallback to memory store (production)
    console.log('File system not available, using memory store for all answers')
    return getAnswersData()
  }
}

export async function searchAnswers(query: string): Promise<Answer[]> {
  try {
    const allAnswers = await getAllAnswers()
    const results: Answer[] = []
    
    Object.values(allAnswers).forEach(dayData => {
      dayData.answers.forEach(answer => {
        if (
          answer.answer.toLowerCase().includes(query.toLowerCase()) ||
          answer.clue.toLowerCase().includes(query.toLowerCase()) ||
          answer.position.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push(answer)
        }
      })
    })
    
    return results
  } catch (error) {
    console.error('Error searching answers:', error)
    return []
  }
}

// Synchronous version for static generation
export function readAnswersData(): Record<string, AnswerData> {
  try {
    const fs = require('fs')
    const data = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading answers data:', error)
    return {}
  }
}
