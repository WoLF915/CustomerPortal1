// Script to hash existing passwords in the database
import bcrypt from 'bcryptjs'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const file = path.join(__dirname, '..', 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

async function hashPasswords() {
  await db.read()
  
  if (!db.data || !db.data.users) {
    console.log('No users found in database')
    return
  }

  const saltRounds = 10
  let hashedCount = 0

  for (const user of db.data.users) {
    // Check if password is already hashed (starts with $2a$)
    if (!user.password.startsWith('$2a$')) {
      console.log(`Hashing password for user: ${user.fullName}`)
      user.password = await bcrypt.hash(user.password, saltRounds)
      hashedCount++
    }
  }

  if (hashedCount > 0) {
    await db.write()
    console.log(`Successfully hashed ${hashedCount} passwords`)
  } else {
    console.log('All passwords are already hashed')
  }
}

hashPasswords().catch(console.error)