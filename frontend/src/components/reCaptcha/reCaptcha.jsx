import {GoogleReCaptchaProvider} from "react-google-recaptcha-v3";

export default function ReCaptcha() {
    return (
        <div>
            <div id="recaptcha"></div>

            <GoogleReCaptchaProvider
                reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY}
                language="en"
                useRecaptchaNet={false}
                useEnterprise={false}
                scriptProps={{
                    async: false,
                    defer: false,
                    appendTo: 'head',
                    nonce: undefined
                }}
            />
        </div>
    )
}