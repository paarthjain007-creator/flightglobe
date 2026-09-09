/**
 * Netlify Serverless Function for API Health Check.
 */

export async function handler(_event, _context) {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "ok", ts: Date.now(), platform: "netlify-serverless" }),
  };
}
