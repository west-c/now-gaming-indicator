import { Client, isFullPage } from '@notionhq/client'
import { QueryDatabaseResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints'
import axios from 'axios'

const NOTION_SECRET = process.env.NOTION_SECRET
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!
const MISSKEY_TOKEN = process.env.MISSKEY_TOKEN
const MISSKEY_API_URL = process.env.MISSKEY_API_URL

const notion = new Client({
  auth: NOTION_SECRET,
})

type TitleObject = {
  type: "title"
  title: Array<RichTextItemResponse>
  id: string
}

type Profile = {
  fields: Field[]
}

type Field = {
  name: string
  value: string
}

async function getGames(): Promise<string[]> {
  const myDatabase: QueryDatabaseResponse = await notion.databases.query({
    database_id: NOTION_DATABASE_ID,
    filter: {
      property: 'Status',
      select: {
        equals: 'やってる',
      },
    },
  })

  return myDatabase.results.map(page => {
    if (!isFullPage(page)) {
      return ''
    }
    const title = page.properties.Title as TitleObject
    return title.title[0].plain_text
  })
}

async function getProfile(): Promise<Profile> {
  const response = await axios.post(MISSKEY_API_URL + '/i', {
    i: MISSKEY_TOKEN,
  })
  return response.data as Profile
}

async function updateProfile(games: string[], profile: Profile): Promise<void> {
  const fields: Field[] = profile.fields.filter(field => field.name !== 'Now Gaming')
  fields.push({
      name: 'Now Gaming',
      value: games.join(' / '),
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
    })
}

async function main(): Promise<void> {
  const games: string[] = await getGames()
  const profile: Profile = await getProfile()
  await updateProfile(games, profile)
}

main()
