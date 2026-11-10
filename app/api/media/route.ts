import { get } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

function parseRange(header: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match || (match[1] === "" && match[2] === "")) return null
  let start: number
  let end: number
  if (match[1] === "") {
    start = Math.max(size - Number(match[2]), 0)
    end = size - 1
  } else {
    start = Number(match[1])
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1)
  }
  if (start > end || start >= size) return null
  return { start, end }
}

function sliceStream(source: ReadableStream<Uint8Array>, start: number, end: number) {
  const reader = source.getReader()
  let position = 0
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          return
        }
        const chunkStart = position
        const chunkEnd = position + value.byteLength
        position = chunkEnd
        if (chunkEnd <= start) continue
        const from = Math.max(start - chunkStart, 0)
        const to = Math.min(end + 1 - chunkStart, value.byteLength)
        controller.enqueue(value.subarray(from, to))
        if (chunkEnd > end) {
          await reader.cancel()
          controller.close()
        }
        return
      }
    },
    cancel(reason) {
      return reader.cancel(reason)
    },
  })
}

export async function GET(request: NextRequest) {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const pathname = request.nextUrl.searchParams.get("path")
  if (!pathname?.startsWith("stories/")) return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  const result = await get(pathname, { access: "private", ifNoneMatch: request.headers.get("if-none-match") ?? undefined })
  if (!result) return new NextResponse("Not found", { status: 404 })
  if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, "Cache-Control": "private, no-cache" } })

  const size = result.blob.size
  const headers = {
    "Content-Type": result.blob.contentType,
    ETag: result.blob.etag,
    "Cache-Control": "private, no-cache",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  }

  const rangeHeader = request.headers.get("range")
  if (rangeHeader && size > 0) {
    const range = parseRange(rangeHeader, size)
    if (!range) return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } })
    return new NextResponse(sliceStream(result.stream, range.start, range.end), {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
        "Content-Length": String(range.end - range.start + 1),
      },
    })
  }

  return new NextResponse(result.stream, { headers: { ...headers, "Content-Length": String(size) } })
}
