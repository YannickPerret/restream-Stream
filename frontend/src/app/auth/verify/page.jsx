'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthApi from "#api/auth.js";

function AuthAuthorize() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [status, setStatus] = useState('Verifying...')
    const hasFetched = useRef(false)

    useEffect(() => {
        if (token && !hasFetched.current) {
            hasFetched.current = true
            const verify = async () => {
                try {
                    await AuthApi.verify(token).then((res) => res.json())
                        .then((data) => {
                        setStatus('Your account has been verified. You can now login.')
                    })
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
                    <h1 className="text-3xl text-white py-4">Verify your account</h1>
                    <hr className="border-b-1 border-blueGray-300 pb-6" />
                </header>

                <div>
                    <h1>{status}</h1>
                </div>
            </div>
        </section>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthAuthorize />
        </Suspense>
    )
}
