'use client'
import React, {useState} from 'react'
import Form from "#components/forms/handleForm/form.jsx";
import FormGroup from "#components/forms/handleForm/formGroup.jsx";


export default function ProviderEditForm({provider, handleSubmit}) {
    const [name, setName] = useState(provider.name ||'')
    const [type, setType] = useState(provider.type ||'')
    const [clientId, setClientId] = useState(provider.clientId ||'')
    const [clientSecret, setClientSecret] = useState(provider.clientSecret ||'')
    const [refreshToken, setRefreshToken] = useState(provider.refreshToken ||'')
    const [authBearer, setAuthBearer] = useState(provider.authBearer ||'')
    const [broadcasterId, setBroadcasterId] = useState(provider.broadcasterId ||'')
    const [streamKey, setStreamKey] = useState(provider.streamKey ||'')


    const handleLocalSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', type);
        formData.append('clientId', clientId);
        formData.append('clientSecret', clientSecret);
        formData.append('refreshToken', refreshToken);
        formData.append('authBearer', authBearer);
        formData.append('broadcasterId', broadcasterId);
        formData.append('streamKey', streamKey);
        handleSubmit(formData);
    }

    return (
        <Form onSubmit={handleLocalSubmit}>
            <FormGroup title={'General'} type={"row"}>
                <FormGroup type={"row"}>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" onChange={(e) => setName(e.target.value)} value={name}/>
                </FormGroup>
                <FormGroup type={"column"}>
                    <label htmlFor="type">Type</label>
                <select
                    className="mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                    value={type} onChange={(e) => setType(e.target.value)}>
                    <option disabled={true} value="">Select an option</option>
                    <option value="Twitch">Twitch</option>
                    <option value="YouTube" disabled={true}>YouTube</option>
                    <option value="Facebook" disabled={true}>Facebook</option>
                </select>
                </FormGroup>
            </FormGroup>

            <FormGroup title={'Informations'} type={"column"}>
                <FormGroup type={"row"}>
                    <label htmlFor="clientId">Client Id</label>
                    <input type="text" id="clientId" name="clientId" onChange={(e) => setClientId(e.target.value)} value={clientId}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="clientSecret">Client Secret</label>
                    <input type="text" id="clientSecret" name="clientSecret" onChange={(e) => setClientSecret(e.target.value)} value={clientSecret}/>
                </FormGroup>

                <FormGroup type={"row"}>
                    <label htmlFor="refreshToken">Refresh Token</label>
                    <input type="text" id="refreshToken" name="refreshToken" onChange={(e) => setRefreshToken(e.target.value)} value={refreshToken}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="authBearer">Auth Bearer</label>
                    <input type="text" id="authBearer" name="authBearer" onChange={(e) => setAuthBearer(e.target.value)} value={authBearer}/>
                </FormGroup>

                <FormGroup type={"row"}>
                    <label htmlFor="broadcasterId">Broadcaster Id</label>
                    <input type="text" id="broadcasterId" name="broadcasterId" onChange={(e) => setBroadcasterId(e.target.value)} value={broadcasterId}/>
                </FormGroup>

                <FormGroup type={"row"}>
                    <label htmlFor="streamKey">Stream Key</label>
                    <input type="text" id="streamKey" name="streamKey" onChange={(e) => setStreamKey(e.target.value)} value={streamKey}/>
                </FormGroup>
            </FormGroup>

            <FormGroup title={'Validate'}>
            <button className="btn btn-success" type="submit">Update</button>
            </FormGroup>
        </Form>
    )
}
