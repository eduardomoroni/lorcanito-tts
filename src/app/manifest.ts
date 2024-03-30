import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lorcanito",
    short_name: "Lorcanito",
    description: "Play Disney Lorcana Online",
    start_url: "/lobbies/",
    display: "standalone",
    orientation: "landscape",
    icons: [
      {
        src: "favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
