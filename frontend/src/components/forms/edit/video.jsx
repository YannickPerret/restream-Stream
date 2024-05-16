import React, {useState} from 'react'
import Form from "#components/forms/handleForm/form.jsx";
import FormGroup from "#components/forms/handleForm/formGroup.jsx";

export default function VideoEditForm({video, handleSubmit}) {
    const [title, setTitle] = useState(video ? video.title : '')
    const [description, setDescription] = useState(video ? video.description : '')
    const [showInLive, setShowInLive] = useState(video ? video.showInLive : false)

    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup title={'General'} type={"row"}>
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" name="title" onChange={(e) => setTitle(e.target.value)} value={title}/>

                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" onChange={(e) => setDescription(e.target.value)} value={description}/>
            </FormGroup>

            <FormGroup title={'Options'} type={"row"}>
                    <label htmlFor="showInLive">Show In Live</label>
                    <input type="checkbox" id="showInLive" name="showInLive" onChange={(e) => setShowInLive(e.target.checked)} checked={showInLive}/>
            </FormGroup>

            <FormGroup title={'Validate'}>
                <button className="btn btn-success" type="submit">Update</button>
            </FormGroup>
        </Form>
    )
}