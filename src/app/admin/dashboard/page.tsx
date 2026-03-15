import { redirect } from "next/navigation"
// Patched: Put '/server' back because your sidebar screenshot shows the file is named server.ts!
import { createClient } from "@/utils/supabase/server"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
// Patched: Added the import for your SignOutButton
import { SignOutButton } from "@/components/SignOutButton"

// This forces Next.js to securely fetch fresh data every time the page loads (SSR)
export const dynamic = 'force-dynamic'

// Define a strict TypeScript interface for the Application data to prevent 'any' errors
interface Application {
  id: string;
  full_name: string;
  barangay: string;
  gpa: number;
  annual_family_income: number;
  total_weighted_score: number;
}

export default async function AdminDashboard() {
  // createClient() is async in Next.js 15, so we MUST await it
  const supabase = await createClient()

  // 1. Security Check: Is the person logged in?
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login') // Kick them back to the login page if not
  }

  // 2. Fetch the students and sort by the highest SAW score!
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .order('total_weighted_score', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-600">Error loading data: {error.message}</div>
  }

  if (!applications || applications.length === 0) {
    return <div className="p-8">No applications found or you do not have Admin access.</div>
  }

  // 3. Math: Count how many scholars are in each barangay
  const distributionReport = applications.reduce((acc: Record<string, number>, app: Application) => {
    acc[app.barangay] = (acc[app.barangay] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 4. The visual design of the Dashboard
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12 bg-slate-50 min-h-screen">
      
      {/* Patched: Replaced the old header with your new flexbox layout and SignOutButton */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Scholarship Committee Dashboard</h1>
          <p className="text-gray-600">E-Scholar Automated Applicant Ranking System</p>
        </div>
        <SignOutButton />
      </div>

      {/* SECTION 1: Barangay Report */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Scholar Distribution per Barangay</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(distributionReport).map(([barangay, count]) => (
            <div key={barangay} className="p-4 border rounded-lg bg-white shadow-sm">
              <p className="text-sm text-gray-500 uppercase font-semibold">{barangay}</p>
              <p className="text-3xl font-bold text-blue-600">{String(count)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Ranked List Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Ranked Candidates (SAW Algorithm)</h2>
        <div className="border rounded-md shadow-sm bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="w-[50px] font-bold">Rank</TableHead>
                <TableHead className="font-bold">Applicant Name</TableHead>
                <TableHead className="font-bold">Barangay</TableHead>
                <TableHead className="text-right font-bold">GPA</TableHead>
                <TableHead className="text-right font-bold">Income (PHP)</TableHead>
                <TableHead className="text-right font-bold text-blue-700">SAW Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app: Application, index: number) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{app.full_name}</TableCell>
                  <TableCell>{app.barangay}</TableCell>
                  <TableCell className="text-right">{app.gpa.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{app.annual_family_income.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    {app.total_weighted_score.toFixed(4)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}