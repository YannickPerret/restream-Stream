'use client';
import React, { useState, useEffect, useRef } from 'react';
import Input from "#components/_forms/Input";
import { SearchApi } from "#api/search";
import Button from "#components/_forms/Button";

const Search = ({ searchUrl, multiple = false, updateSelectedItems, label = "Search" }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    // Effect to trigger search on query change with debounce
    useEffect(() => {
        if (query.length >= 3) {
            const delayDebounceFn = setTimeout(() => {
                handleSearch();
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSearch = async () => {
        try {
            const data = { domain: searchUrl, query };
            const response = await SearchApi.search(data);

            // Accéder aux résultats réels dans la réponse
            const results = response.results || [];

            setResults(results);
            setShowResults(true);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    const handleSelect = (item) => {
        if (multiple) {
            if (!selectedItems.some(selected => selected.id === item.id)) {
                const newSelectedItems = [...selectedItems, item];
                setSelectedItems(newSelectedItems);
                updateSelectedItems(newSelectedItems);
            }
        } else {
            setSelectedItems([item]);
            updateSelectedItems(item);
            setShowResults(false); // Hide results after selection if not multiple
        }
    };


    const handleRemove = (itemId) => {
        const newSelectedItems = selectedItems.filter(item => item.id !== itemId);
        setSelectedItems(newSelectedItems);
        updateSelectedItems(newSelectedItems);
    };

    const handleClickOutside = (event) => {
        if (
            inputRef.current &&
            !inputRef.current.contains(event.target) &&
            resultsRef.current &&
            !resultsRef.current.contains(event.target)
        ) {
            setShowResults(false);
        }
    };

    const handleInputClick = () => {
        if (results.length > 0) {
            setShowResults(true);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [results]);

    return (
        <div className="relative" ref={inputRef}>
            <Input
                type="text"
                placeholder={label}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={handleInputClick}
                required
            />

            {showResults && results.length > 0 && (
                <div
                    ref={resultsRef}
                    className="absolute z-10 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-h-64 overflow-y-auto mt-2 w-full border border-violet-500 z-50"
                >
                    <ul>
                        {results.map(item => (
                            <li
                                key={item.id}
                                className="flex justify-between items-center py-2 hover:bg-gray-700 cursor-pointer rounded px-2"
                                onClick={() => handleSelect(item)}
                            >
                                <span>{item.title || item.name || 'No Title Available'}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedItems.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-white mb-2">Selected Items:</h3>
                    <ul className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">
                        {selectedItems.map(item => (
                            <li key={item.id} className="flex justify-between items-center py-2">
                                <span>{item.title || item.name || 'No Title Available'}</span>
                                <Button label="Remove" onClick={() => handleRemove(item.id)} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Search;
