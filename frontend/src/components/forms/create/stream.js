'use client';
import React, { useState, useEffect } from 'react';
import { StreamApi } from '#api/stream.js';
import SearchForm from '../../search/searchForm.jsx';
import Form from "#components/forms/handleForm/form.jsx";
import FormGroup from "#components/forms/handleForm/formGroup.jsx";

export default function StreamForm({ onSubmit }) {
    const [title, setTitle] = useState('');
    const [providers, setProviders] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [primaryProvider, setPrimaryProvider] = useState(null);
    const [runLive, setRunLive] = useState(false);
    const [logo, setLogo] = useState('')
    const [overlay, setOverlay] = useState('')

    const handleSubmit = async event => {
        event.preventDefault();

        const providersWithPrimary = providers.map(provider => ({
            ...provider,
            onPrimary: provider.id === (primaryProvider?.id || null),
        }));

        const formData = new FormData();
        formData.append('title', title);
        formData.append('timeline', timeline.id);
        formData.append('runLive', runLive);
        formData.append('providers', JSON.stringify(providersWithPrimary));

        if (logo) {
            formData.append('logo', logo);
        }
        if (overlay) {
            formData.append('overlay', overlay);
        }

        await StreamApi.create(formData).then(response => {
                console.log(response);
            })
            .catch(error => {
                console.error(error);
            });
    };

    const handlePrimaryChange = provider => {
        if (primaryProvider && primaryProvider.id === provider.id) {
            setPrimaryProvider(null);
        } else {
            setPrimaryProvider(provider);
        }
    };

    useEffect(() => {
        if (primaryProvider && !providers.some(provider => provider.id === primaryProvider.id)) {
            setPrimaryProvider(null);
        }
    }, [providers]);

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup title={"Stream"} type={"column"}>
                <FormGroup type={"row"}>
                    <label>Title</label>
                    <input
                        type="text"
                        placeholder="Enter Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required={true}
                    />
                </FormGroup>
            </FormGroup>

            <FormGroup title={"Timeline"} type={"column"}>
                <FormGroup type={"row"}>
                    <label>Timeline</label>
                    <SearchForm searchUrl="timelines" multiple={false} updateSelectedItems={setTimeline} />
                </FormGroup>

                <FormGroup type={"row"}>
                    <label>Timeline selected:</label>
                    <div>
                        <label>{timeline?.title}</label>
                    </div>
                </FormGroup>
            </FormGroup>

            <FormGroup title={"Providers"} type={"column"}>
                <FormGroup type={"row"}>
                    <label>Providers selected : <span style={{color:"mediumvioletred"}}>(check one primary provider required)</span></label>
                    {providers.map(provider => (
                        <div key={provider.id}>
                            <label>{provider.name}</label>
                            <input
                                type="radio"
                                checked={primaryProvider ? provider.id === primaryProvider.id : false}
                                onChange={() => handlePrimaryChange(provider)}
                            />
                        </div>
                    ))}
                </FormGroup>

                <FormGroup type={"row"}>
                    <label>Provider</label>
                    <SearchForm searchUrl="providers" multiple={true} updateSelectedItems={setProviders} />
                </FormGroup>
            </FormGroup>

            <FormGroup title={"Assets"} type={"column"}>
                <FormGroup type={"row"}>
                    <label>Upload logo</label>
                    <input type="file" onChange={e => setLogo(e.target.files[0])} accept={'image/*'}/>
                </FormGroup>

                <FormGroup type={"row"}>
                    <label>Upload overlay</label>
                    <input type="file" onChange={e => setOverlay(e.target.files[0])} accept={'image/*'}/>
                </FormGroup>
            </FormGroup>

            <FormGroup title={"Options"} type={"column"}>
                <FormGroup type={"row"}>
                    <label>Launch live directly</label>
                    <input type="checkbox" checked={runLive} onChange={e => setRunLive(e.target.checked)} />
                </FormGroup>
            </FormGroup>


            <FormGroup title="Validations" type={"row"}>
                <button className="btn btn-success" type="submit">Create new timeline</button>
            </FormGroup>
        </Form>
    );
}
