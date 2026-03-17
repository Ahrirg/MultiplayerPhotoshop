import { useState } from 'react';
import axios from "axios";

interface ChatMessage {
    username: string,
    message: string,
}
interface input {
    sessionIp: string
}
export function Chat({sessionIp} : input) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    async function getMessages() {
        const response = await axios.get(`${sessionIp}/messages`); 
        console.log(response.data)

        return response.data
    }   

    return (
        <>
            <div>
                test chat
            </div>    
        </>
    );
}