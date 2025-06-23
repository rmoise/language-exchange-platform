'use server'

import { revalidatePath } from 'next/cache'

export async function refreshCommunityData() {
  revalidatePath('/app/connect')
}