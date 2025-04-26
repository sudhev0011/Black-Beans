import { Link } from "react-router-dom"
export default function NotFound() {
  return (<>

{/* Main Content */}
<main className="flex-1 py-1">
  <div className="container mx-auto px-4 text-center">
    <div className="mx-auto max-w-lg">
      <img
        src="/404.png"
        alt="404 Illustration"
        width={600}
        height={270}
        className="mx-auto"
      />
      <h1 className="mb-4 text-4xl font-bold text-[#333333] md:text-5xl">That Page Can't Be Found</h1>
      <p className="mb-8 text-[#6b7280]">
        It looks like nothing was found at this location. Maybe try to search for what you are looking for?
      </p>
      <Link
        to="/"
        className="inline-block rounded bg-[#114639] px-6 py-3 font-medium text-white transition-colors hover:bg-opacity-90"
      >
        Go To Homepage
      </Link>
    </div>
  </div>
</main>
</>)
}