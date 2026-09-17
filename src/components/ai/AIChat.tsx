import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Database, Code2 } from 'lucide-react';
import { aiService, agentService } from '../../services/api';
import { AIThinkingIndicator } from './AIThinkingIndicator';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  toolLogs?: any[];
  timestamp: string;
}

interface AIChatProps {
  siteId?: string;
  siteName?: string;
}

export const AIChat: React.FC<AIChatProps> = ({ siteId, siteName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: siteName
        ? `Hello! I am **Darukaa AI**. I have loaded spatial & telemetry context for **${siteName}**. Ask me anything about carbon stock, biodiversity score, or tree cover trends!`
        : `Hello! I am **Darukaa Earth Intelligence Agent**. Ask me questions across managed projects, such as: "Which site has shown the largest improvement in biodiversity?" or "Which project has the largest area?"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState('Querying PostGIS spatial index...');

  const sampleQuestions = [
    "Which site has shown the largest improvement in biodiversity?",
    "Which project has the largest area?",
    "Compare site performance across active sectors",
    "What should I investigate first?",
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsThinking(true);

    try {
      if (siteId) {
        setThinkingStatus(`Retrieving analytics telemetry for site ${siteId}...`);
        const res = await aiService.chat(textToSend, siteId);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setThinkingStatus('Selecting backend application tools (get_sites, get_biodiversity_trend)...');
        const res = await agentService.queryAgent(textToSend);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.final_answer,
          toolLogs: res.tool_logs,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error executing backend tools for this query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[580px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Darukaa AI Assistant
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                Agentic Tool Mesh
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Grounded strictly in database & PostGIS telemetry</p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[80%] space-y-2`}>
              <div
                className={`p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>

              {/* Render Tool Logs if present */}
              {m.toolLogs && m.toolLogs.length > 0 && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-sans font-semibold">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Agent Tool Executions ({m.toolLogs.length})</span>
                  </div>
                  {m.toolLogs.map((log: any, idx: number) => (
                    <div key={idx} className="pl-2 border-l border-slate-800">
                      <span className="text-amber-400 font-bold">{log.tool_name}</span>(
                      {JSON.stringify(log.arguments)})
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-500 px-1">{m.timestamp}</p>
            </div>
            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isThinking && <AIThinkingIndicator statusText={thinkingStatus} />}
      </div>

      {/* Sample Quick Questions */}
      {!siteId && messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-slate-800/60 hover:bg-slate-800 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Darukaa AI a grounded question..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={isThinking || !input.trim()}
          className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
