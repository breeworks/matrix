import FrontPage from "./frontpage/page"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <h1 className="text-3xl font-light m-8 text-gray-800">DAILY MATRIX</h1>
      <FrontPage />
    </main>
  )
}
