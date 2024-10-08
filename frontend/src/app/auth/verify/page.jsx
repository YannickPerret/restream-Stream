'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthApi from "#api/auth.js";
import Panel from "#components/layout/panel/Panel.jsx";

function AuthAuthorize() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [status, setStatus] = useState('Verifying...')
    const hasFetched = useRef(false)

    useEffect(() => {
        console.log("Token from URL:", token);
        if (token && !hasFetched.current) {
            hasFetched.current = true
            const verify = async () => {
                try {
                    const formData = new FormData();
                    formData.append('token', token);
                    await AuthApi.verify(formData).then(() => {
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
        <Panel title={'Account Verification'}>
            <h1>{status}</h1>
        </Panel>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthAuthorize />
        </Suspense>
    )
}
