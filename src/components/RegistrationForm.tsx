'use client'

import { zodResolver } from "@hookform/resolvers/zod"
// Patched: Imported 'Resolver' type from react-hook-form
import { useForm, type Resolver } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { DocumentUpload } from "@/components/DocumentUpload"

// 1. Define the rules
const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  barangay: z.string().min(2, "Barangay is required."),
  gpa: z.coerce.number().min(1.0, "GPA cannot be less than 1.0").max(5.0, "GPA cannot exceed 5.0"),
  annualFamilyIncome: z.coerce.number().min(0, "Income cannot be negative.")
})

// 2. Create a strict Type to stop TypeScript from complaining
type FormValues = z.infer<typeof formSchema>

export function RegistrationForm() {
  const[isSubmitting, setIsSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const supabase = createClient()

  // 3. Use the strict Type here 
  // Patched: Cast the resolver output to Resolver<FormValues> to safely bypass the z.coerce mismatch
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: { fullName: "", barangay: "", gpa: 0, annualFamilyIncome: 0 },
  })

  // 4. And use it here
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Error: You must be logged in.")
        setIsSubmitting(false)
        return
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          full_name: values.fullName,
          barangay: values.barangay,
          gpa: values.gpa,
          annual_family_income: values.annualFamilyIncome,
        })
        .select()
        .single()

      if (error) throw error
      
      setApplicationId(data.id)

    } catch (error) {
      alert("Error: " + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (applicationId) {
    return (
      <div className="text-center mt-10">
        <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold mb-6">
          Step 1 Complete: Form Saved!
        </div>
        <DocumentUpload applicationId={applicationId} />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-900">Step 1: Scholarship Application</h2>
        
        <FormField control={form.control} name="fullName" render={({ field }) => (
          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Juan Dela Cruz" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="barangay" render={({ field }) => (
          <FormItem><FormLabel>Barangay (Surigao City)</FormLabel><FormControl><Input placeholder="Washington" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="gpa" render={({ field }) => (
          <FormItem><FormLabel>General Weighted Average (GPA)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="1.25" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="annualFamilyIncome" render={({ field }) => (
          <FormItem><FormLabel>Annual Family Income (PHP)</FormLabel><FormControl><Input type="number" placeholder="150000" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save and Continue to Upload"}
        </Button>
      </form>
    </Form>
  )
}