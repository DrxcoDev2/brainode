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
        <div className="h-auto max-h-[calc(100vh-100px)] border border-gray-200 dark:border-gray-800 items-center w-full bg-gray-50 rounded-xl p-16 -pb-16 my-16 dark:bg-black">
            <Conversation className="relative w-full" style={{ height: '500px' }}>
                <ConversationContent>
                    {messages.length === 0 ? (
                        <ConversationEmptyState
                            icon={<MessageSquare className="size-12" />}
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
            <PromptInput onSubmit={() => { }} className="mt-4 relative">
                <PromptInputBody>
                    <PromptInputAttachments>
                        {(attachment) => (
                            <PromptInputAttachment data={attachment} />
                        )}
                    </PromptInputAttachments>
                    <PromptInputTextarea onChange={(e) => { }} value={''} />
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
                    <PromptInputSubmit
                        disabled={false}
                        status={'ready'}
                    />
                </PromptInputToolbar>
            </PromptInput>
        </div>
    );
}
