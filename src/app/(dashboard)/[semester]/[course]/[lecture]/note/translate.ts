'use server';

type TRequestBody = {
  from: string;
  to: string;
  text: string;
};

type TResponseBody = {
  trans: string;
  source_language_code: string;
  source_language: string;
  trust_level: number;
};

export async function translate(text: string): Promise<String> {
  'use server';

  const body: TRequestBody = {
    from: 'auto',
    to: 'ko',
    text: text,
  };

  if (!process.env.TRANSLATION_API_URL) {
    throw new Error('Translation API URL is not defined');
  }

  if (!process.env.RAPID_API_HOST) {
    throw new Error('RAPID_API_HOST is not defined');
  }

  if (!process.env.RAPID_API_KEY) {
    throw new Error('RAPID_API_KEY is not defined');
  }

  const response = await fetch(process.env.TRANSLATION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': process.env.RAPID_API_HOST,
      'x-rapidapi-key': process.env.RAPID_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Translation failed');
  }

  const data: TResponseBody = await response.json();
  return data.trans;
}
