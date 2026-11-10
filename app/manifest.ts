import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return { name:"yap yap! private scrapbook journal", short_name:"yap yap!", description:"Our private scrapbook journal.", start_url:"/", display:"standalone", background_color:"#0c0c0d", theme_color:"#0c0c0d", orientation:"portrait", icons:[{ src:"/icon.svg", sizes:"any", type:"image/svg+xml", purpose:"maskable" }] }
}
