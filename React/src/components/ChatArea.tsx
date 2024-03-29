import { useState } from "react";
import { Conversation, Message } from "../types";

const SendIcon = () => <svg className="w-5 h-5 rotate-90 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
<path fillRule="evenodd" d="M12 2c.4 0 .8.3 1 .6l7 18a1 1 0 0 1-1.4 1.3L13 19.5V13a1 1 0 1 0-2 0v6.5L5.4 22A1 1 0 0 1 4 20.6l7-18a1 1 0 0 1 1-.6Z" clipRule="evenodd"/>
</svg>

interface ChatAreaProps {
    conversation: Conversation | null
    loading: boolean
    onNewMessage: any;
}

const ChatArea: React.FC<ChatAreaProps> = ({conversation, loading, onNewMessage}) => {
    const [newMessage, setNewMessage] = useState<string>('')

    const onSend = () => {
        if (!newMessage) return
        if (loading) return
        onNewMessage(newMessage)
        setNewMessage('')
    }

    if (!conversation) return <div className="flex-1"></div>
    return (
        <div className="flex-1 flex flex-col py-2 px-1">
            <div className="flex">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} 
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          onSend()
                        }
                      }}
                    className="w-full mr-1 bg-gray-0 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-gray-500 focus:border-gray-500 block
                    p-1 px-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500" 
                    placeholder="Write your question..." required></input>
                <button className="p-1 border border-gray-500 bg-white" disabled={loading} onClick={onSend}>
                    <SendIcon />
                </button>
            </div>
            <div className="flex-1 overflow-auto p-1 text-sm">
                {conversation.messages.map((message: Message, index: number) => message.role == 'user'
                    ? <div className={"flex ml-4 mb-1 justify-end max-w-100 "} key={'user-' + index}>
                        <div className="p-1 px-2 rounded-md bg-gray-100 rounded-tr-none">
                            {message.content}
                        </div>
                    </div>
                    : message.role == 'assistant' ? <div className="max-w-100 mr-4 mb-1 justify-start flex" key={'assistant-' + index}>
                        <div className="p-1 px-2 rounded-md bg-sky-50 rounded-tl-none">
                            {message.content}
                        </div>
                    </div>
                    : ''
                )}

                {(loading) && 
                    <div className="flex justify-center">
                        <div role="status">
                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default ChatArea;
