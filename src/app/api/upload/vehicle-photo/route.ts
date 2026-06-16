import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB after client-side compression
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: Request) {
  // Auth check — return JSON, not redirect
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'ADMIN' && user.role !== 'SECRETARY') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const vehicleId = (formData.get('vehicleId') as string) || 'new'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Accepted: JPG, PNG, WEBP` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 2MB` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
    const timestamp = Date.now()
    const randomId = crypto.randomUUID().slice(0, 8)
    const storagePath = `${vehicleId}/${timestamp}-${randomId}.${ext}`

    // Use direct Supabase client with service role key (not cookie-based)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('vehicle-photos')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('vehicle-photos')
      .getPublicUrl(storagePath)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}
