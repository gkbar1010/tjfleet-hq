import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure user exists in our DB
      const existing = await prisma.user.findUnique({
        where: { id: data.user.id },
      })

      if (!existing) {
        await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            fullName: data.user.user_metadata?.full_name || data.user.email!,
            role: 'VIEWER',
          },
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
