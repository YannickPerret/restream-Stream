'use client'

import {useEffect} from "react";
import {ProviderApi} from "../../../../api/provider";
import {useProviderStore} from "../../../../stores/useProviderStore";
import ProviderIndex from "../../../../views/providers";

export default function ProvidersPage() {

    useEffect(() => {
        const fetchProviders = async () => {
            await ProviderApi.getAll().then((data) => {
                useProviderStore.setState({
                    providers: data.providers
                })
            })
        }
        fetchProviders();
    }, []);
    return (
        <section>
            <header>
                <h1>Providers</h1>
            </header>

            <div>
                <ProviderIndex/>
            </div>
        </section>
    )
}