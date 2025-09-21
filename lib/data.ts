import fs from 'fs/promises'
import path from 'path'

interface Answer {
  clue: string
  answer: string
  position: string
  confidence: number
}

interface AnswerData {
  date: string
  answers: Answer[]
  scrapedAt: string
  source: string
  totalAnswers: number
  screenshot?: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'answers.json')

export async function getTodayAnswers(date: string): Promise<AnswerData | null> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8')
    const allAnswers = JSON.parse(data)
    
    if (allAnswers[date]) {
      return allAnswers[date]
    }
    
    return null
  } catch (error) {
    console.error('Error reading answers data:', error)
    return null
  }
}

export async function getAllDates(): Promise<string[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8')
    const allAnswers = JSON.parse(data)
    
    return Object.keys(allAnswers).sort((a, b) => b.localeCompare(a))
  } catch (error) {
    console.error('Error reading dates:', error)
    return []
  }
}

export async function getAllAnswers(): Promise<Record<string, AnswerData>> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading all answers:', error)
    return {}
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
