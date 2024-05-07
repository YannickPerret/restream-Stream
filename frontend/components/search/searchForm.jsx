'use client';
import { useState, useEffect } from 'react';
import SearchInput from './SearchInput';
import { SearchApi } from '../../api/search';

export default function SearchForm({ searchUrl, multiple = false, updateSelectedItems }) {
    const [form, setForm] = useState({ query: '', domain: searchUrl });
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const handleUpdateSelectedItems = newItems => {
        const updatedItems = multiple ? newItems : [newItems[0]];
        setSelectedItems(updatedItems);
        updateSelectedItems(updatedItems)
    };

    useEffect(() => {
        let timeout;
        if (form.query.length >= 2) {
            timeout = setTimeout(() => {
                search();
            }, 500);
        } else {
            setItems([]);
        }
        return () => clearTimeout(timeout);
    }, [form.query]);

    const search = async () => {
        try {
            const response = await SearchApi.search({ query: form.query, domain: form.domain });
            if (response && response.results) {
                setItems(response.results);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche', error);
        }
    };

    const handleInputChange = event => {
        setForm({ ...form, query: event.target.value });
    };

    return (
        <div>
            <input value={form.query} onChange={handleInputChange} placeholder="Rechercher..." />
            {items && (
                <SearchInput
                    items={items}
                    domain={form.domain}
                    selectedItems={selectedItems}
                    multiple={multiple}
                    updateSelectedItems={handleUpdateSelectedItems}
                />
            )}
        </div>
    );
}
