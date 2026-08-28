import type { MetadataRoute } from "next";

/* The web app manifest, which is what lets a member add this to a
   home screen and open it like an app.

   Worth stating why that matters here rather than being a checkbox.
   A great many people in the audience for this do not have a laptop
   and do not use bookmarks; the home screen is the whole of their
   filing system. A claim that takes four months to resolve is one a
   member has to come back to a dozen times, and every one of those
   returns currently starts with trying to remember a URL, or with a
   search that lands on one of the many sites that impersonate this
   one. An icon they placed themselves is the safest route back.

   display: "standalone" removes the browser chrome, which is also
   why the disclosure that this is not an official EPFO service is in
   the page furniture rather than only in the title. */

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EPF Member Portal — a redesign concept",
    short_name: "EPF Portal",
    description:
      "An independent redesign concept for the provident fund member portal, with a decoder for the remark that blocked your claim. Not an official EPFO service.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f7fa",
    theme_color: "#001e40",
    lang: "en-IN",
    categories: ["government", "finance", "utilities"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    /* Long-press the home-screen icon and these are the four things a
       member most often needs to reach without going through a
       landing page first. */
    shortcuts: [
      {
        name: "Why was my claim rejected?",
        short_name: "Decode",
        url: "/login/",
      },
      { name: "All services A–Z", short_name: "Services", url: "/services/" },
      { name: "Help & contact", short_name: "Help", url: "/help/" },
      { name: "Plain language", short_name: "Glossary", url: "/glossary/" },
    ],
  };
}
