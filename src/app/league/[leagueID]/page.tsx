export default function page({ params }: { params: { leagueID: string } }) {
  return <div>leagueID: {params.leagueID}</div>;
}
