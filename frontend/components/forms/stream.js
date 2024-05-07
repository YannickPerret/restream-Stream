'use client'
import React, {useState} from 'react'
import {StreamApi} from "../../api/stream";
import SearchForm from "../search/searchForm";
export default function StreamForm({onSubmit}) {
    const [title, setTitle] = useState('')
    const [providers, setProviders] = useState([])

    const handleSubmit = async () => {
        await StreamApi.create({title, providers});
    }

    return(
        <form onSubmit={handleSubmit}>
            <label>
                Title
            </label>
            <input type="text" placeholder="Enter Title" value={title} onChange={(e) => setTitle(e.target.value)}/>

            <div>
                providers selected: {providers.map(provider => provider.name).join(', ')}
            </div>

            <div>
                <label>Provider</label>
                <SearchForm searchUrl="providers" multiple="true" updateSelectedItems={setProviders}/>

            </div>

            <button>Submit</button>
        </form>
    )
}