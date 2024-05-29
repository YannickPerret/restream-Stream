import React, {useState} from 'react'
import Form from "#components/forms/handleForm/form.jsx";
import FormGroup from "#components/forms/handleForm/formGroup.jsx";

export default function VideoEditForm({video, handleSubmit}) {
    const [title, setTitle] = useState(video?.title || '')
    const [description, setDescription] = useState(video?.description || '')
    const [showInLive, setShowInLive] = useState(video?.showInLive || false)
    const [status, setStatus] = useState(video?.status || '')

    const handleLocalSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('showInLive', showInLive ? 1 : 0);
        formData.append('status', status);
        handleSubmit(formData);
    }

    return (
        <Form onSubmit={handleLocalSubmit}>
            <FormGroup title={'General'} type={"row"}>
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" onChange={(e) => setTitle(e.target.value)} value={title}/>

                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" onChange={(e) => setDescription(e.target.value)} value={description}/>
            </FormGroup>

            <FormGroup title={'Options'} type={"column"}>
                <FormGroup type={"row"}>
                    <label htmlFor="showInLive">Show In Live</label>
                    <input type="checkbox" id="showInLive" name="showInLive" onChange={(e) => setShowInLive(e.target.checked)} checked={showInLive}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" onChange={(e) => setStatus(e.target.value)} value={status}>
                        <option value="unpublished">Unpublished</option>
                        <option value="published">Published</option>
                        <option value="pending">Pending</option>
                    </select>
                </FormGroup>

            </FormGroup>

            <FormGroup title={'Validate'}>
                <button className="btn btn-success" type="submit">Update</button>
            </FormGroup>
        </Form>
    )
}
