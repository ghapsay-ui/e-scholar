'use client'

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DocumentUpload({ applicationId }: { applicationId: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setIsUploading(true)
      
      // 1. Get the file the student selected
      const file = event.target.files?.[0]
      if (!file) return

      // 2. Security Check: Make sure it is actually a PDF
      if (file.type !== "application/pdf") {
        alert("Error: Only PDF documents are allowed.")
        setIsUploading(false)
        return
      }

      // 3. Check who is logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Error: You must be logged in.")
        setIsUploading(false)
        return
      }

      // 4. Create a secure folder path: (Student's Secret ID) / (Application ID)_documents.pdf
      const filePath = `${user.id}/${applicationId}_documents.pdf`
      
      // 5. Send the file to the 'documents' bucket in Supabase
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // 6. Tell the database that this student has uploaded their file
      const { error: dbError } = await supabase
        .from('applications')
        .update({ documents_url: filePath })
        .eq('id', applicationId)

      if (dbError) throw dbError

      alert("Success! Your PDF document has been uploaded.")

    } catch (error) { // Patched: Removed explicit ': any' to fix ESLint error
      // Patched: Cast error to Error object to safely access .message
      alert("Upload Error: " + (error as Error).message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-sm bg-white space-y-4 mt-8">
      <h2 className="text-xl font-bold text-blue-900">Step 2: Upload Requirements</h2>
      <p className="text-sm text-gray-600">
        Please upload your physical documents (Grades, Certificate of Indigency, Proof of Residency) merged as a single PDF file.
      </p>
      
      <div className="grid w-full max-w-sm items-center gap-1.5 mt-4">
        <Label htmlFor="document">Digital Document (PDF only)</Label>
        <Input 
          id="document" 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileUpload} 
          disabled={isUploading} 
        />
      </div>
      
      {isUploading && <p className="text-sm text-blue-600 font-medium mt-2">Uploading your document, please wait...</p>}
    </div>
  )
}