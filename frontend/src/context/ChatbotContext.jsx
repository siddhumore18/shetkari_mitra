import { createContext, useContext, useState, useRef, useCallback } from 'react';

const ChatbotContext = createContext(null);

export const useChatbot = () => {
    const ctx = useContext(ChatbotContext);
    if (!ctx) throw new Error('useChatbot must be used inside ChatbotProvider');
    return ctx;
};

export const ChatbotProvider = ({ children }) => {
    // Disease context string (pushed by DiseaseDetection after a scan)
    const [diseaseContext, setDiseaseContext] = useState('');

    // Whether the chat window is open
    const [isOpen, setIsOpen] = useState(false);

    // A pending trigger message — when set, the chatbot will auto-send it once open
    const triggerRef = useRef(null);

    /**
     * Open the chatbot and optionally auto-send a first message.
     * @param {string} [message] - optional pre-composed message to auto-send
     */
    const openChatbot = useCallback((message = '') => {
        if (message) triggerRef.current = message;
        setIsOpen(true);
    }, []);

    const closeChatbot = useCallback(() => setIsOpen(false), []);

    return (
        <ChatbotContext.Provider
            value={{
                diseaseContext,
                setDiseaseContext,
                isOpen,
                setIsOpen,
                openChatbot,
                closeChatbot,
                triggerRef,          // AIChatbot reads + clears this ref
            }}
        >
            {children}
        </ChatbotContext.Provider>
    );
};
