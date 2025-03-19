import FrontPage from "./frontpage/page"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
      <h1 className="text-3xl font-light m-8 text-gray-800">DAILY MATRIX</h1>
      <FrontPage />
    </main>
  )
}
