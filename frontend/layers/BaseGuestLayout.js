import Navigator from "@/components/Navigator";
import Image from "next/image";
import Logo from "../public/coffeeStream.png";

export default function BaseGuestLayout({ children }) {
  return (
    <div className="flex h-screen">
      <aside className="flex flex-col w-64 h-screen">
        <div className="flex flex-col h-full shadow-lg">
          <div className="bg-blue-500 p-5 border-b border-gray-200">
            <Image src={Logo} alt={"Logo de CoffeeStream"} />
          </div>
          <div className="flex-1 px-5 py-2 bg-blue-900">
            <Navigator />
          </div>
          <div className="bg-gray-800 text-black p-5 text-sm">
            © 2024 Axonite - All rights reserved
          </div>
        </div>
      </aside>
      <main className="flex flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}