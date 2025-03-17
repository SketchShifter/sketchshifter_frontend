

export async function GET() {
  return new Response(JSON.stringify({ message: "API Route" }), {
    headers: { "content-type": "application/json" },
  });
}
