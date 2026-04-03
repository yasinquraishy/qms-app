/**
 * Execute a GraphQL request via fetch().
 * @param {string} url
 * @param {object} headers
 * @param {string} query
 * @param {object} variables
 * @returns {Promise<object>} The `data` field from the response
 */
export async function graphqlRequest(url, headers, query, variables) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const error = new Error(`GraphQL request failed: ${res.status}`);
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  if (json.errors?.length) {
    const error = new Error(json.errors[0].message);
    error.graphqlErrors = json.errors;
    throw error;
  }
  return json.data;
}
