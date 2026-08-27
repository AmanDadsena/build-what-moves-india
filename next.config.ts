import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Every route in this app is static: the knowledge base, the mock
     cases and the document templates are all compiled in, and nothing
     is fetched at request time. Exporting to plain HTML means there is
     no server to cold-start and no function to invoke — the whole app
     is files on a CDN, which is what makes it open quickly on the slow
     connections this is meant to serve. */
  output: "export",

  /* Static hosts serve /case/990012345678/index.html, so the route
     needs the trailing-slash form to resolve without a server. */
  trailingSlash: true,

  images: { unoptimized: true },
};

export default nextConfig;
