export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY;

  return key;
}
