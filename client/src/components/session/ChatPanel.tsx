import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Session } from '@bgn/shared';
import { socket } from '../../socket';

interface ChatPanelProps {
  session: Session;
  myNickname: string;
}

const MAX_TEXT = 500;

export function ChatPanel({ session, myNickname }: ChatPanelProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.chat]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    socket.emit('chat:send', { sessionId: session.id, text: trimmed });
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <h3 className="border-b border-gray-100 px-4 py-2.5 text-[9px] font-bold text-gray-700">
        Chat
      </h3>

      <div
        className="flex max-h-[40vh] min-h-[120px] flex-col gap-1 overflow-y-auto p-3"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {session.chat.length === 0 && (
          <p className="text-center text-[9px] text-gray-400">No messages yet. Say hi!</p>
        )}
        {session.chat.map((msg) => {
          const isMine = msg.authorNickname === myNickname;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
            >
              {!isMine && (
                <span className="mb-0.5 text-[8px] font-bold text-gray-500">
                  {msg.authorNickname}
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-3 py-1.5 text-[9px] leading-relaxed ${
                  isMine
                    ? 'rounded-br-sm bg-indigo-600 text-white'
                    : 'rounded-bl-sm bg-gray-100 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 p-3">
        <label htmlFor="chat-input" className="sr-only">
          Type a message
        </label>
        <div className="flex gap-2">
          <textarea
            id="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
            onKeyDown={handleKeyDown}
            placeholder="Say something… (Enter to send)"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            aria-label="Send message"
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
          >
            Send
          </button>
        </div>
        {text.length > MAX_TEXT * 0.8 && (
          <p className="mt-1 text-xs text-gray-400">{MAX_TEXT - text.length} chars left</p>
        )}
      </div>
    </div>
  );
}
