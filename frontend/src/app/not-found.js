'use client'
import Link from "next/link";

export default function NotFound () {
    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Something went wrong</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6"/>
                </header>

            <div className="flex flex-col">
                Error 404
                <Link href="/">Return Home</Link>
            </div>
            </div>
        </section>
    )
}
