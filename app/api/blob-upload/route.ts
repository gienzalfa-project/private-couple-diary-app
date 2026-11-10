import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { requireSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        await requireSession()
        if (!/^stories\/[A-Za-z0-9-]+\.[A-Za-z0-9]{1,5}$/.test(pathname)) throw new Error("Invalid file name.")
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "video/mp4", "video/webm", "video/quicktime"],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: false,
        }
      },
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
