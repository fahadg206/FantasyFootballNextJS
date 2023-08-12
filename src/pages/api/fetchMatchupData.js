export default async function handler(req, res) {
  const response = await axios.get(
    "https://api.sleeper.app/v1/league/:leagueID/users"
  );
  const leagueID = req.params.leagueID;

  console.log(leagueID);

  return res.status(200).json(response.data);
}
