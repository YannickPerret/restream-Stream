import {useProviderStore} from "#stores/useProviderStore.js";

export default function ProvidersShowView() {
    const provider = useProviderStore.use.selectedProvider()

    if (!provider) {
        return <div>loading...</div>
    }

    return (
        <div className="p-4">
            <div className="shadow-md rounded p-4">
                <h2 className="text-xl font-semibold">Provider name : {provider.name}</h2>
                <p>Provider type : {provider.type}</p>
                <p>Client Id : {provider.clientId}</p>
                <p>Client Secret : {provider.clientSecret}</p>
                <p>Refresh token : {provider.refreshToken}</p>
                <p>Broadcaster Id : {provider.broadcasterId}</p>
                <p>Auth Bearer : {provider.authBearer}</p>
                <p>Stream Key : {provider.streamKey}</p>
                <p>Created by : {provider.user.fullName}</p>
            </div>
        </div>
    )
}