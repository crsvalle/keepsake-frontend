import React from 'react'
import ChatSidebar from '../Components/Messages/ChatSidebar';
import Chat from '../Components/Messages/Chat';
import { ChatProvider } from '../context/ChatContext';
import '../style/chat.css'


export default function Inbox() {
    return (
        <ChatProvider>
            <div className='inbox-page'>
                <div className="inbox-container ">
                    <div className="px-5  flex justify-between items-center bg-white">
                        <div className="font-semibold text-2xl">Chat</div>
                    </div>
                    <div className="flex box-bottom">
                        <ChatSidebar />
                        <div className="w-full">
                            <Chat />
                        </div>
                        {/* <div className="w-2/5 border-l-2 px-5">
                        <div className="flex flex-col">
                        </div>
                    </div> */}
                    </div>
                </div>
            </div>
        </ChatProvider>
    );
}