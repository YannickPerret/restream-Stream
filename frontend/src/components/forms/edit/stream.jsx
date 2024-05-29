'use client'
import React, {useState} from 'react'
import Form from "#components/forms/handleForm/form.jsx";
import FormGroup from "#components/forms/handleForm/formGroup.jsx";
import SearchForm from "#components/search/searchForm.jsx";
import Image from "next/image";

export default function StreamEditForm({stream, handleSubmit}) {
    const [name, setName] = useState(stream.name ||'')
    const [restartTimes, setRestartTimes] = useState(stream.restartTimes || 0)
    const [timeline, setTimeline] = useState(stream.timeline || []);

    const [logo, setLogo] = useState({
        file: null,
        preview: stream.logo ? `${process.env.NEXT_PUBLIC_BASE_URL}/images/${stream.logo}` : null
    });
    const [overlay, setOverlay] = useState({
        file: null,
        preview: stream.overlay ? `${process.env.NEXT_PUBLIC_BASE_URL}/images/${stream.overlay}` : null
    });

    const handleFileChange = (e, setFileState) => {
        const file = e.target.files[0];
        setFileState({
            file: file,
            preview: URL.createObjectURL(file)
        });
    }

    const handleLocalSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('restartTimes', restartTimes);
        formData.append('timeline', timeline.id);
        if (logo.file) {
            formData.append('logo', logo.file);
        }
        if (overlay.file) {
            formData.append('overlay', overlay.file);
        }
        handleSubmit(formData);
    }

    return (
        <Form onSubmit={handleLocalSubmit}>
            <FormGroup title={'General'} type={"row"}>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" onChange={(e) => setName(e.target.value)} value={name}/>

                <label htmlFor="restartTimes">Time before restart</label>
                <input type="number" min={0} id="restartTimes" name="restartTimes" onChange={(e) => setRestartTimes(e.target.value)} value={restartTimes}/>

                <label htmlFor="logo">Stream logo</label>
                {logo.preview && (
                    <Image src={logo.preview} alt='logo du stream' width={50} height={50} />
                )}
                <input type="file" id="logo" name="logo" onChange={(e) => handleFileChange(e, setLogo)}/>

                <label htmlFor="overlay">Stream Overlay</label>
                {overlay.preview && (
                    <Image src={overlay.preview} alt='overlay du stream' width={50} height={50} />
                )}
                <input type="file" id="overlay" name="overlay" onChange={(e) => handleFileChange(e, setOverlay)}/>

            </FormGroup>

            <FormGroup title={'Timeline'} type={"row"}>
                <div>
                    Timeline selected:
                    <div>
                        <label>{timeline?.title}</label>
                    </div>
                </div>
                <label htmlFor="timeline">Change timeline</label>
                <SearchForm searchUrl="timelines" multiple={false} updateSelectedItems={setTimeline}/>

            </FormGroup>

            <FormGroup title={'Validate'}>
                <button className="btn btn-success" type="submit">Update</button>
            </FormGroup>
        </Form>
    )
}
