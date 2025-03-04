
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const formData = await req.formData()
    const file = formData.get('file')
    const catId = formData.get('catId')
    const userId = formData.get('userId')
    const isPrimary = formData.get('isPrimary') === 'true'
    const mediaType = formData.get('mediaType') || 'image'

    if (!file || !catId || !userId) {
      return new Response(
        JSON.stringify({ error: 'File, catId, and userId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Verify user owns the cat
    const { data: catData, error: catError } = await supabase
      .from('cats')
      .select('id')
      .eq('id', catId)
      .eq('user_id', userId)
      .single()

    if (catError || !catData) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to upload to this cat' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Create a unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${catId}/${crypto.randomUUID()}.${fileExt}`

    // Upload file to storage
    const { data, error: uploadError } = await supabase.storage
      .from('cat_media')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cat_media')
      .getPublicUrl(fileName)

    // If this is the primary image, update any existing primary images to false
    if (isPrimary) {
      await supabase
        .from('cat_media')
        .update({ is_primary: false })
        .eq('cat_id', catId)
        .eq('is_primary', true)
    }

    // Save file metadata to database
    const { data: mediaData, error: mediaError } = await supabase
      .from('cat_media')
      .insert({
        cat_id: catId,
        file_path: fileName,
        media_type: mediaType,
        is_primary: isPrimary
      })
      .select()
      .single()

    if (mediaError) {
      console.error('Media insert error:', mediaError)
      return new Response(
        JSON.stringify({ error: 'Failed to save media metadata', details: mediaError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        media: { ...mediaData, url: publicUrl }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in upload-media function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
