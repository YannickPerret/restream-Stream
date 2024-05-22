import {useProviderStore} from "#stores/useProviderStore";

export default function ProviderIndex() {
    const providers = useProviderStore.use.providers()

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400" >
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Client ID</th>
                        <th scope="col" className="px-6 py-3">Client Secret</th>
                        <th scope="col" className="px-6 py-3">Refresh Token</th>
                        <th scope="col" className="px-6 py-3">Broadcaster Id</th>
                        <th scope="col" className="px-6 py-3">Auth Bearer</th>
                        <th scope="col" className="px-6 py-3">Stream Key</th>
                    </tr>
                </thead>

                <tbody>
                    {providers.map(provider => (
                        <tr key={provider.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{provider.name}</th>
                            <td>{provider.type}</td>
                            <td>{provider.clientId}</td>
                            <td>{provider.clientSecret}</td>
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