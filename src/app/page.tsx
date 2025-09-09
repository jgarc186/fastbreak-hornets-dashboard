import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FastBreak Dashboard</h1>
          <p className="text-gray-600 mb-8">Charlotte Hornets Player Insights</p>
          
          <div className="space-y-4">
            <a 
              href="/auth/login?screen_hint=signup"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </a>
            <a 
              href="/auth/login"
              className="block w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Log In
            </a>
          </div>
          
          <p className="text-gray-500 text-sm mt-6">
            Access comprehensive player statistics and performance insights
          </p>
        </div>
      </main>
    );
  }

  // Redirect authenticated users to dashboard
  redirect("/dashboard");
}
