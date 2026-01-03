import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function saveFile(
  file: File,
  folder: 'resumes' | 'cover-letters'
): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads', folder)

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  // Generate unique filename
  const timestamp = Date.now()
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${timestamp}-${originalName}`
  const filepath = path.join(uploadsDir, filename)

  // Save file
  await writeFile(filepath, buffer)

  // Return relative path
  return `/uploads/${folder}/${filename}`
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase()
}

export function isValidResumeFile(filename: string): boolean {
  const validExtensions = ['.pdf', '.doc', '.docx']
  return validExtensions.includes(getFileExtension(filename))
}

export function isValidCoverLetterFile(filename: string): boolean {
  const validExtensions = ['.pdf', '.doc', '.docx', '.txt']
  return validExtensions.includes(getFileExtension(filename))
}
