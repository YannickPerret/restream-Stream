'use client'
import {useEffect} from "react";
import useErrorStore from "#stores/useErrorStore.js";

export const ErrorComponent = () => {
    const {error, reset} = useErrorStore

    useEffect(() => {
        if (error && error.type) {
            const timer = setTimeout(() => {
                reset();
            }, 8000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    if (error && error.type){
        console.log(error)
        return (
            <div className={`error ${error.type}`}>
                {error.message}
            </div>
        )
    }

    else return null
}