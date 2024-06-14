'use client'
import React, {useState} from 'react'
import Form from "#components/forms/handleForm/form.jsx";
import FormGroup from "#components/forms/handleForm/formGroup.jsx";


export default function GuestEditForm({guest, handleSubmit}) {
    const [email, setEmail] = useState(guest.email ||'')
    const [displayName, setDisplayName] = useState(guest.displayName ||'')
    const [discordUsername , setDiscordUsername] = useState(guest.discordUsername ||'')
    const [steamUsername, setSteamUsername] = useState(guest.steamUsername ||'')
    const [twitchUsername, setTwitchUsername] = useState(guest.twitchUsername ||'')
    const [youtubeUsername, setYoutubeUsername] = useState(guest.youtubeUsername ||'')
    const [twitterUsername, setTwitterUsername] = useState(guest.twitterUsername ||'')
    const [telegramUsername, setTelegramUsername] = useState(guest.telegramUsername ||'')
    const [canDiffuse, setCanDiffuse] = useState(guest.canDiffuse ||'')
    const [notes, setNote] = useState(guest.notes ||'')


    const handleLocalSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('email', email);
        formData.append('displayName', displayName);
        formData.append('discordUsername', discordUsername);
        formData.append('steamUsername', steamUsername);
        formData.append('twitchUsername', twitchUsername);
        formData.append('youtubeUsername', youtubeUsername);
        formData.append('twitterUsername', twitterUsername);
        formData.append('telegramUsername', telegramUsername);
        formData.append('canDiffuse', canDiffuse);
        formData.append('notes', notes);
        handleSubmit(formData);
    }

    return (
        <Form onSubmit={handleLocalSubmit}>
            <FormGroup title={'General'} type={"row"}>
                <FormGroup type={"row"}>
                    <label htmlFor="email">Email</label>
                    <input type="text" id="email" name="email" onChange={(e) => setEmail(e.target.value)} value={email}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="displayName">Display Name</label>
                    <input type="text" id="displayName" name="displayName" onChange={(e) => setDisplayName(e.target.value)} value={displayName}/>
                </FormGroup>
            </FormGroup>

            <FormGroup title={'Social'} type={"column"}>
                <FormGroup type={"row"}>
                    <label htmlFor="discordUsername">Discord</label>
                    <input type="text" id="discordUsername" name="discordUsername" onChange={(e) => setDiscordUsername(e.target.value)} value={discordUsername}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="steamUsername">Steam</label>
                    <input type="text" id="steamUsername" name="steamUsername" onChange={(e) => setSteamUsername(e.target.value)} value={steamUsername}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="twitchUsername">Twitch</label>
                    <input type="text" id="twitchUsername" name="twitchUsername" onChange={(e) => setTwitchUsername(e.target.value)} value={twitchUsername}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="youtubeUsername">Youtube</label>
                    <input type="text" id="youtubeUsername" name="youtubeUsername" onChange={(e) => setYoutubeUsername(e.target.value)} value={youtubeUsername}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="twitterUsername">Twitter</label>
                    <input type="text" id="twitterUsername" name="twitterUsername" onChange={(e) => setTwitterUsername(e.target.value)} value={twitterUsername}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="telegramUsername">Telegram</label>
                    <input type="text" id="telegramUsername" name="telegramUsername" onChange={(e) => setTelegramUsername(e.target.value)} value={telegramUsername}/>
                </FormGroup>
            </FormGroup>

            <FormGroup title={'Other'} type={"column"}>
                <FormGroup type={"row"}>
                    <label htmlFor="canDiffuse">Can diffuse</label>
                    <input type="checkbox" id="canDiffuse" name="canDiffuse" onChange={(e) => setCanDiffuse(e.target.checked)} checked={canDiffuse}/>
                </FormGroup>
                <FormGroup type={"row"}>
                    <label htmlFor="note">Note</label>
                    <textarea id="note" name="note" onChange={(e) => setNote(e.target.value)} value={notes}/>
                </FormGroup>
            </FormGroup>

            <FormGroup title={'Validate'}>
                <button className="btn btn-success" type="submit">Update</button>
            </FormGroup>
        </Form>
    )
}
