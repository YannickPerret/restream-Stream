'use client';
import React, { useState, useEffect } from 'react';
import { StreamApi } from '../../api/stream';
import SearchForm from '../search/searchForm';

export default function StreamForm({ onSubmit }) {
    const [title, setTitle] = useState('');
    const [providers, setProviders] = useState([]);
    const [timeline, setTimeline] = useState({});
    const [primaryProvider, setPrimaryProvider] = useState(null);
    const [runLive, setRunLive] = useState(false);

    const handleSubmit = async event => {
        event.preventDefault();

        const providersWithPrimary = providers.map(provider => ({
            ...provider,
            onPrimary: provider.id === (primaryProvider?.id || null),
        }));

        await StreamApi.create({
            title,
            providers: providersWithPrimary,
            timeline,
            runLive,
        })
            .then(response => {
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
        <form onSubmit={handleSubmit}>
            <label>Title</label>
            <input
                type="text"
                placeholder="Enter Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />

            <div>
                <label>Timeline</label>
                <SearchForm searchUrl="timelines" multiple={false} updateSelectedItems={setTimeline} />
            </div>

            <div>
                Providers selected:
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
            </div>

            <div>
                <label>Provider</label>
                <SearchForm searchUrl="providers" multiple={true} updateSelectedItems={setProviders} />
            </div>

            <div>
                <label>Launch live directly</label>
                <input type="checkbox" checked={runLive} onChange={e => setRunLive(e.target.checked)} />
            </div>

            <button type="submit">Submit</button>
        </form>
    );
}
