import { Graffle } from "graffle";

export function createGraphQLClient(url, { headers = {}, onError } = {}) {
  const client = Graffle.create().transport({ url, headers });

  return {
    client,
    async request(document, variables = {}) {
      try {
        const result = await client.gql(document).$send(variables);
        return result;
      } catch (err) {
        onError?.(err);
        throw err;
      }
    },
  };
}
