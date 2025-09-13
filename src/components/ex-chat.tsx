import { Actions, Action } from '@/components/ai-elements/actions';
import { ThumbsUpIcon } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { Message, MessageContent } from './ai-elements/message';
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from '@/components/ui/conversation-mode';
import { useState } from 'react';

import {
    PromptInput,
    PromptInputActionAddAttachments,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuItem,
    PromptInputActionMenuTrigger,
    PromptInputAttachment,
    PromptInputAttachments,
    PromptInputBody,
    PromptInputButton,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
    usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';

type ChatMessage = {
    id: string;
    from: 'user' | 'assistant' | 'system';
    content: string;
};

export default function ExChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            from: 'user',
            content: 'Hola, ¿qué tal?',
        },
        {
            id: '2',
            from: 'assistant',
            content: 'Todo bien, ¿y tú?',
        },
        {
            id: '3',
            from: 'user',
            content: 'Quiero probar el sistema de mensajes.',
        },
        {
            id: '4',
            from: 'system',
            content: 'La sesión se ha iniciado correctamente.',
        },
    ]);


    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="h-auto max-h-[calc(100vh-100px)] w-full max-w-6xl lg:max-w-5xl md:max-w-4xl sm:max-w-full border border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50 rounded-xl my-8 px-2 dark:bg-black">
            {/* Header */}
            <div className="h-12 border-b p-4 flex items-center justify-between">
                <h1 className="text-base sm:text-lg md:text-xl font-bold">Brainode</h1>
                <div className="flex space-x-2">
                    <div className="rounded-full bg-red-400 w-3 h-3 sm:w-4 sm:h-4"></div>
                    <div className="rounded-full bg-yellow-400 w-3 h-3 sm:w-4 sm:h-4"></div>
                    <div className="rounded-full bg-green-400 w-3 h-3 sm:w-4 sm:h-4"></div>
                </div>
            </div>

            {/* Conversation */}
            <Conversation
                className="relative flex-1 w-full p-4 sm:p-6 md:p-10 lg:p-16 overflow-hidden"
                style={{ minHeight: "300px" }}
            >
                <ConversationContent>
                    {messages.length === 0 ? (
                        <ConversationEmptyState
                            icon={<MessageSquare className="size-10 sm:size-12" />}
                            title="No messages yet"
                            description="Start a conversation to see messages here"
                        />
                    ) : (
                        messages.map((message) => (
                            <Message from={message.from} key={message.id}>
                                <MessageContent>{message.content}</MessageContent>
                            </Message>
                        ))
                    )}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            {/* Prompt input */}
            <PromptInput
                onSubmit={() => { }}
                className="mt-4 relative w-full max-w-xl mx-auto mb-6 sm:mb-10"
            >
                <PromptInputBody>
                    <PromptInputAttachments>
                        {(attachment) => <PromptInputAttachment data={attachment} />}
                    </PromptInputAttachments>
                    <PromptInputTextarea onChange={(e) => { }} value={""} />
                </PromptInputBody>
                <PromptInputToolbar>
                    <PromptInputTools>
                        <PromptInputActionMenu>
                            <PromptInputActionMenuTrigger />
                            <PromptInputActionMenuContent>
                                <PromptInputActionAddAttachments />
                            </PromptInputActionMenuContent>
                        </PromptInputActionMenu>
                    </PromptInputTools>
                    <PromptInputSubmit disabled={false} status={"ready"} />
                </PromptInputToolbar>
            </PromptInput>
        </div>

    );
}
