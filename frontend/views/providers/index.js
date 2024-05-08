import {useProviderStore} from "../../stores/useProviderStore";

export default function ProviderIndex() {
    const providers = useProviderStore.use.providers()

    console.log(providers)

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Client ID</th>
                        <th>Client Secret</th>
                        <th>Access Token</th>
                        <th>Refresh Token</th>
                        <th>Broadcaster Id</th>
                        <th>Auth Bearer</th>
                        <th>Stream Key</th>
                    </tr>
                </thead>

                <tbody>
                    {providers.map(provider => (
                        <tr key={provider.id}>
                            <td>{provider.name}</td>
                            <td>{provider.type}</td>
                            <td>{provider.clientId}</td>
                            <td>{provider.clientSecret}</td>
                            <td>{provider.accessToken}</td>
                            <td>{provider.refreshToken}</td>
                            <td>{provider.broadcasterId}</td>
                            <td>{provider.authBearer}</td>
                            <td>{provider.streamKey}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}