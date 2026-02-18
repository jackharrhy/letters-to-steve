import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const customReadable = new ReadableStream({
    async start(controller) {
      let count = 0;
      controller.enqueue(`event: count\ndata: ${count}\n\n`);

      const interval = setInterval(() => {
        count++;
        try {
          controller.enqueue(`event: count\ndata: ${count}\n\n`);
        } catch (error) {
          console.error(error);
          clearInterval(interval);
        }
      }, 1000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch (error) {
          console.error(error);
        }
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
};
