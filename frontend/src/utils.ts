


type Doc = {
  [key: string]: any
};

// const gql_endpoint = 'http://localhost:4000';
const gql_endpoint = 'https://games.oclyke.dev/gql/call-late/v0/';

export async function fetch_gql(query: string, variables?: Doc) {
  const r = await fetch(gql_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    })
  });
  const data = await r.json();
  if (data.errors) {
    throw new Error(data.errors.map(e => `error from graphql resolver: ${e.message}`));
  }
  return data;
}
