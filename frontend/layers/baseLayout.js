import Navigateur from "../components/navigateur";

export default function BaseLayout({ children }) {
  return (
    <div className="w-64 bg-gray-800 flex flex-col">
      <div className="bg-blue-500 text-white p-5 text-lg font-bold">
        Coffe-Stream
      </div>
      <Navigateur />
      <div className="bg-gray-900 text-white p-5 text-sm">
        © 2024 Axonite - All rights reserved
      </div>
    </div>
  )
}