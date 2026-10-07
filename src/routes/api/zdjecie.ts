import { createFileRoute } from "@tanstack/react-router";
import { findProductImage } from "@/lib/product-image";

export const Route = createFileRoute("/api/zdjecie")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const kod = url.searchParams.get("kod") ?? "";
        const nazwa = url.searchParams.get("nazwa") ?? "";
        if (!kod && !nazwa) {
          return Response.json({ url: null }, { status: 400 });
        }
        const image = await findProductImage(kod, nazwa);
        return Response.json(
          { url: image },
          {
            headers: {
              "Cache-Control": "public, max-age=86400",
            },
          },
        );
      },
    },
  },
});
