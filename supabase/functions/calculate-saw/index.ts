import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

serve(async (req) => {
  try {
    // 1. Get the Application ID sent from the website
    const { record_id } = await req.json()

    // 2. Connect to the database using the powerful "Service Role" key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Fetch the specific student's grades and income
    const { data: applicant, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('gpa, annual_family_income, barangay')
      .eq('id', record_id)
      .single()

    if (fetchError || !applicant) throw new Error("Applicant not found")

    // 4. Fetch ALL students to find the "Best" (Lowest) GPA and Income for the math formula
    const { data: allApplicants } = await supabaseAdmin.from('applications').select('gpa, annual_family_income')
    
    // In the Philippines, 1.0 is the best GPA. Lower income is also prioritized.
    const minGpa = Math.min(...allApplicants.map(a => a.gpa))
    const minIncome = Math.min(...allApplicants.map(a => a.annual_family_income))

    // 5. The SAW Math Formula (PDF Page 4)
    // Formula: (Best Score / Student's Score)
    const academic_score = minGpa / applicant.gpa; 
    
    // Prevent math errors if income is exactly 0
    const safeIncome = applicant.annual_family_income === 0 ? 1 : applicant.annual_family_income;
    const safeMinIncome = minIncome === 0 ? 1 : minIncome;
    const income_score = safeMinIncome / safeIncome;

    // Residency: 100% (1.0) if they typed a barangay, otherwise 0%
    const residency_score = applicant.barangay ? 1.0 : 0.0;

    // 6. Apply the 40% / 40% / 20% Weights!
    const total_weighted_score = (academic_score * 0.4) + (income_score * 0.4) + (residency_score * 0.2);

    // 7. Save the final score back to the database
    await supabaseAdmin
      .from('applications')
      .update({ academic_score, income_score, residency_score, total_weighted_score })
      .eq('id', record_id)

    return new Response(JSON.stringify({ success: true, total_weighted_score }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) { // Patched: Removed explicit ': any' to fix ESLint error
    // Patched: Cast error to Error object to safely access .message
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})