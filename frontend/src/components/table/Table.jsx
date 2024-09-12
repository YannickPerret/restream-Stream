'use client'
import React, { useState } from 'react';

/****** To use it*****/
/*
const columns = ["Name", "Role", "Email", "Status"];
const data = [
    ["Jane Doe", "Developer", "jane.doe@example.com", "Active"],
    ["John Smith", "Designer", "john.smith@example.com", "Inactive"],
    ["Alice Johnson", "Product Manager", "alice.johnson@example.com", "Active"],
    ["Robert Brown", "CEO", "robert.brown@example.com", "Active"],
];
 */

const Table = ({ columns, data, darkMode = false }) => {
    const [sortConfig, setSortConfig] = useState(null);

    const sortedData = React.useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const requestSort = key => {
        let direction = 'ascending';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'ascending'
        ) {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    const tableClasses = darkMode
        ? "bg-gray-900 text-white"
        : "bg-white text-black";

    const headerClasses = darkMode
        ? "bg-gray-800 text-gray-400"
        : "bg-gray-200 text-gray-700";

    const rowEvenClasses = darkMode
        ? "bg-gray-800"
        : "bg-gray-100";

    const rowOddClasses = darkMode
        ? "bg-gray-900"
        : "bg-white";

    return (
        <div className={`${tableClasses} p-8 rounded-b-lg overflow-x-auto`}>
            <table className="min-w-full table-auto">
                <thead>
                <tr className={headerClasses}>
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                                getClassNamesFor(col.key) === 'ascending' ? 'text-indigo-400' : ''
                            } ${getClassNamesFor(col.key) === 'descending' ? 'text-red-400' : ''}`}
                            onClick={() => requestSort(col.key)}
                        >
                            {col.title}
                            {getClassNamesFor(col.key) && (
                                <span className={`ml-2 ${getClassNamesFor(col.key) === 'ascending' ? 'arrow-up' : 'arrow-down'}`}>
                                    {getClassNamesFor(col.key) === 'ascending' ? '▲' : '▼'}
                                </span>
                            )}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {sortedData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={`border-b border-gray-700 transition-colors duration-300 hover:bg-gray-700 ${rowIndex % 2 === 0 ? rowEvenClasses : rowOddClasses}`}>
                        {columns.map((col) => (
                            <td
                                key={col.key}
                                className="px-6 py-4 text-sm font-medium break-words"
                            >
                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;