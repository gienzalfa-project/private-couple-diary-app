import { NextResponse } from "next/server"
import { z } from "zod"
import { requireSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { pushSubscriptions } from "@/lib/db/schema"
const schema=z.object({endpoint:z.string().url(),keys:z.object({p256dh:z.string().min(1),auth:z.string().min(1)})})
export async function POST(request:Request){try{const session=await requireSession();const data=schema.parse(await request.json());await db.insert(pushSubscriptions).values({author:session.author,endpoint:data.endpoint,p256dh:data.keys.p256dh,auth:data.keys.auth}).onConflictDoUpdate({target:pushSubscriptions.endpoint,set:{author:session.author,p256dh:data.keys.p256dh,auth:data.keys.auth}});return NextResponse.json({ok:true})}catch{return NextResponse.json({error:'Could not save notification settings.'},{status:400})}}
