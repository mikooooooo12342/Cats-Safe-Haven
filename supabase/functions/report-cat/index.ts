
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

    const { catId, userId, reason } = await req.json()

    if (!catId || !userId) {
      return new Response(
        JSON.stringify({ error: 'catId and userId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if the user has already reported this cat
    const { data: existingReport } = await supabase
      .from('cat_reports')
      .select('id')
      .eq('cat_id', catId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingReport) {
      return new Response(
        JSON.stringify({ error: 'You have already reported this cat' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create a new report
    const { data, error } = await supabase
      .from('cat_reports')
      .insert({
        cat_id: catId,
        user_id: userId,
        reason
      })
      .select()

    if (error) {
      console.error('Report error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to report cat', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get the current report count
    const { data: reportCountData } = await supabase
      .from('cat_reports')
      .select('id', { count: 'exact' })
      .eq('cat_id', catId)

    const reportsCount = reportCountData?.length || 0

    return new Response(
      JSON.stringify({ 
        success: true, 
        report: data[0],
        reports_count: reportsCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in report-cat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
