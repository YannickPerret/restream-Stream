import React from 'react';
import SearchFormProvider from './SearchFormProvider';
import SearchFormTimeline from "#components/search/SearchFormTimeline.js";

export default function SearchInput({ items, domain, selectedItems, multiple, updateSelectedItems }) {
    const toggleItem = item => {
        if (multiple) {
            const index = selectedItems.findIndex(selected => selected.id === item.id);
            const updatedItems = [...selectedItems];

            if (index > -1) {
                updatedItems.splice(index, 1);
            } else {
                updatedItems.push(item);
            }

            updateSelectedItems(updatedItems);
        } else {
            updateSelectedItems([item]);
        }
    };

    return (
        <ul>
            {items.map(item => (
                <li key={item.id} onClick={() => toggleItem(item)} className="cursor-pointer">
                    {domain === 'providers' && <SearchFormProvider provider={item} />}
                    {domain === 'timelines' && <SearchFormTimeline timeline={item} />}
                </li>
            ))}
        </ul>
    );
}
