import Navigator from "@/components/Navigator";
import Logo from "../public/coffeeStream.png";
import Image from "next/image";

export default function BaseGuestLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-800 flex flex-col">

        <div className="bg-blue-500 text-white p-5 text-lg font-bold">
          <Image src={Logo} alt={"Logo de CoffeeStream"} />
        </div>

        <Navigator />

        <div className="bg-gray-900 text-white p-5 text-sm">
          © 2024 Axonite - All rights reserved
        </div>
      </div>
        {children}
      </div>
    )
  }