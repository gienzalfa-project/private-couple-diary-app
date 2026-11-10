import 'server-only'
import * as webpush from 'web-push'
import { eq,ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pushSubscriptions } from '@/lib/db/schema'
import type { Author } from '@/lib/auth'
export async function notifyPartner(author:Author,storyId:string){const publicKey=process.env.VAPID_PUBLIC_KEY;const privateKey=process.env.VAPID_PRIVATE_KEY;if(!publicKey||!privateKey)return;webpush.setVapidDetails('mailto:notifications@dear-raehan.local',publicKey,privateKey);const subscriptions=await db.select().from(pushSubscriptions).where(ne(pushSubscriptions.author,author));await Promise.allSettled(subscriptions.map(async subscription=>{try{await webpush.sendNotification({endpoint:subscription.endpoint,keys:{p256dh:subscription.p256dh,auth:subscription.auth}},JSON.stringify({title:'A new moment was shared',body:'Open yap yap! to see it.',url:`/story/${storyId}`}))}catch(error){if(typeof error==='object'&&error&&'statusCode' in error&&((error as {statusCode:number}).statusCode===404||(error as {statusCode:number}).statusCode===410))await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id,subscription.id))}}))}
