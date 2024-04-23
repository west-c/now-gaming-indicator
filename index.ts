import axios from 'axios';

const NOW_GAMIMNG_API_URL: string = process.env.NOW_GAMIMNG_API_URL ?? '';
const MISSKEY_TOKEN: string = process.env.MISSKEY_TOKEN ?? '';
const MISSKEY_API_URL: string = process.env.MISSKEY_API_URL ?? '';

type Games = {
  now_gaming: string[];
};

type Profile = {
  fields: Field[];
};

type Field = {
  name: string;
  value: string;
};

async function getGames(): Promise<string[]> {
  try {
    const response = await axios.get(NOW_GAMIMNG_API_URL);
    const data = response.data as Games;
    return data.now_gaming;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get games');
  }
}

async function getProfile(): Promise<Profile> {
  try {
    const response = await axios.post(`${MISSKEY_API_URL}/i`, {
      i: MISSKEY_TOKEN,
    });
    return response.data as Profile;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get profile');
  }
}

async function updateProfile(games: string[], profile: Profile): Promise<void> {
  const fields: Field[] = profile.fields.filter(
    (field) => field.name !== 'Now Gaming',
  );
  fields.push({
    name: 'Now Gaming',
    value: games.length !== 0 ? games.join(' / ') : 'おやすみ中',
  });

  try {
    await axios.post(`${MISSKEY_API_URL}/i/update`, {
      i: MISSKEY_TOKEN,
      fields,
    });
    console.log('Updated.');
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update profile');
  }
}

(async function main(): Promise<void> {
  const games: string[] = await getGames();
  const profile: Profile = await getProfile();
  await updateProfile(games, profile);
})();
