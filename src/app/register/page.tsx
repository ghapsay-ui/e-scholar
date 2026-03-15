import { SignOutButton } from "@/components/SignOutButton"
import { RegistrationForm } from "@/components/RegistrationForm"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* NEW: Sign Out Button at the top right */}
        <div className="flex justify-end mb-4">
          <SignOutButton />
        </div>

        {/* Header Section */}
        <div className="text-center mb-8"></div>
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Surigao City Scholarship Application
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please fill out the form below accurately. Your data will be evaluated fairly using the Simple Additive Weighting (SAW) algorithm.
          </p>
        </div>

        {/* This imports the form we built in Step 6! */}
        <RegistrationForm />
        
      </div>
    </div>
  )
}