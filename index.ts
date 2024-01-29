import { Client } from '@notionhq/client'
import axios from 'axios';

const NOTION_SECRET = process.env.NOTION_SECRET
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!
const MISSKEY_TOKEN = process.env.MISSKEY_TOKEN
const MISSKEY_API_URL = process.env.MISSKEY_API_URL

const notion = new Client({
  auth: NOTION_SECRET,
})

async function getGames() {
  const myDatabase = await notion.databases.query({
    database_id: NOTION_DATABASE_ID,
    filter: {
      property: 'Status',
      select: {
        equals: 'やってる',
      },
    },
  })
  const results: any[] = myDatabase.results
  const list: string[] = results.map(page => page.properties.Title.title[0].plain_text)
  return list
}

async function getProfile() {
  const response = await axios.post(MISSKEY_API_URL + '/i', {
    i: MISSKEY_TOKEN,
  })
  return response.data
}

async function updateProfile(games: string[], profile: any) {
  const fields: any[] = profile.fields.filter((field: any) => field.name !== 'Now Gaming')
  fields.push({
      name: 'Now Gaming',
      value: games.length !== 0 ? games.join(' / ') : 'おやすみ中',
    })

  axios.post(MISSKEY_API_URL + '/i/update', {
      i: MISSKEY_TOKEN,
      fields: fields,
    })
    .then(() => {
      console.log('Updated.');
    })
    .catch(error => {
      console.error(error)
    });
}

async function main() {
  const games: string[] = await getGames()
  const profile: any = await getProfile()
  await updateProfile(games, profile)
}

main()
