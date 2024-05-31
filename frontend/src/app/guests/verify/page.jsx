'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GuestAuthorize() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [status, setStatus] = useState('Verifying...')
    const hasFetched = useRef(false)

    useEffect(() => {
        if (token && !hasFetched.current) {
            hasFetched.current = true
            const verify = async () => {
                try {
                    console.log("Verifying token")
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/guests/verify/${token}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                    if (!response.ok) {
                        const errorMessage = await response.text()
                        setStatus(`Error: ${errorMessage}`)
                    } else {
                        const successMessage = await response.text()
                        setStatus(successMessage)
                    }
                } catch (e) {
                    setStatus(`Error: ${e.message}`)
                }
            }

            verify()
        }
    }, [token])

    return (
        <section className="flex flex-col w-full h-full rounded-2xl justify-center shadow-2xl">
            <div className="bg-slate-500">
                <header className="container mx-auto">
                    <h1 className="text-3xl text-white py-4">Verify your Guest upload</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6" />
                </header>

                <div>
                    <h1>{status}</h1>
                </div>
            </div>
        </section>
    )
}