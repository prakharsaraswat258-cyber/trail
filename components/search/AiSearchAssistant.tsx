'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, AlertCircle, FileText, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { ExtractedSpecs } from '@/lib/aiSearch';
import { EnrichedMatchResult } from '@/lib/matching';
import AiMatchCard from './AiMatchCard';
import ItemDetailDrawer from '@/components/ItemDetailDrawer';

export interface ChatThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: 'ask_clarifying_question' | 'search_results' | 'no_input_understood';
  extracted?: ExtractedSpecs;
  matches?: EnrichedMatchResult[];
  timestamp: string;
}

interface AiSearchAssistantProps {
  onStartReportWithSpecs?: (specs?: ExtractedSpecs) => void;
}

const STARTER_PROMPTS = [
  'I lost my blue Milton water bottle yesterday',
  'Left my AirPods in the cafeteria',
  'Lost a black leather wallet near Block 36',
  'Lost my room keys near the gym',
];

export default function AiSearchAssistant({ onStartReportWithSpecs }: AiSearchAssistantProps) {
  const [messages, setMessages] = useState<ChatThreadMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'Hi there! I can help you search the campus inventory for lost items without filing a report first. Tell me what you lost, including any details like color, brand, location, or when you last saw it.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drawer state for viewing match details / claim
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const userQuery = (textToSend || input).trim();
    if (!userQuery || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: ChatThreadMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      // Send conversational history formatted for the backend API
      const payload = {
        messages: nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatThreadMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Here is what I found based on your description.',
        action: data.action,
        extracted: data.extracted,
        matches: data.matches,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI search request failed:', err);
      setError('Unable to reach the search assistant right now. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Hi there! I can help you search the campus inventory for lost items without filing a report first. Tell me what you lost, including any details like color, brand, location, or when you last saw it.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
    setError(null);
  };

  const handleViewMatchDetails = (match: EnrichedMatchResult) => {
    setSelectedItem({
      id: match.found_item_id,
      item_name: match.item_name,
      title: match.item_name,
      category: match.category,
      date_found: match.date_found,
      location_building: match.location_found,
      ai_reasoning: match.ai_reasoning,
      confidence_score: match.confidence_score,
      confidence_label: match.confidence_label,
    });
    setIsDrawerOpen(true);
  };

  // Get the most recently extracted specs from conversation if any
  const latestExtractedSpecs = [...messages]
    .reverse()
    .find((m) => m.extracted)?.extracted;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[750px] min-h-[480px] bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-3 bg-[#FAF8F3] border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F2E8E2] text-[#C96442] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C1B18] flex items-center gap-1.5">
              <span>Campus AI Search Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online" />
            </h3>
            <p className="text-[11px] text-[#6E6B5F]">
              Real-time matching against found inventory
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          title="Restart search conversation"
          className="text-xs font-medium text-[#6E6B5F] hover:text-[#1C1B18] p-1.5 rounded-lg hover:bg-[#ECEAE2] transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start Over</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF8F3]/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#1C1B18] text-white rounded-br-xs'
                    : 'bg-white text-[#1C1B18] border border-[rgba(0,0,0,0.07)] rounded-bl-xs'
                }`}
              >
                {/* Message text */}
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Extracted Specs Tag Strip (if present on assistant message) */}
                {msg.extracted && (
                  <div className="mt-2.5 pt-2 border-t border-[rgba(0,0,0,0.06)] flex flex-wrap gap-1.5">
                    {msg.extracted.category && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-[#FAF8F3] text-[#4A473F] px-2 py-0.5 rounded border border-[rgba(0,0,0,0.06)] font-medium">
                        <span className="text-[#A8A49A]">Category:</span> {msg.extracted.category}
                      </span>
                    )}
                    {msg.extracted.color && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-[#FAF8F3] text-[#4A473F] px-2 py-0.5 rounded border border-[rgba(0,0,0,0.06)] font-medium">
                        <span className="text-[#A8A49A]">Color:</span> {msg.extracted.color}
                      </span>
                    )}
                    {msg.extracted.brand && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-[#FAF8F3] text-[#4A473F] px-2 py-0.5 rounded border border-[rgba(0,0,0,0.06)] font-medium">
                        <span className="text-[#A8A49A]">Brand:</span> {msg.extracted.brand}
                      </span>
                    )}
                    {msg.extracted.date_lost && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-[#FAF8F3] text-[#4A473F] px-2 py-0.5 rounded border border-[rgba(0,0,0,0.06)] font-medium">
                        <span className="text-[#A8A49A]">Date:</span> {msg.extracted.date_lost}
                      </span>
                    )}
                    {msg.extracted.location_lost && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-[#FAF8F3] text-[#4A473F] px-2 py-0.5 rounded border border-[rgba(0,0,0,0.06)] font-medium">
                        <span className="text-[#A8A49A]">Location:</span> {msg.extracted.location_lost}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Match Cards List (if any matches found) */}
              {msg.matches && msg.matches.length > 0 && (
                <div className="w-full max-w-[92%] sm:max-w-[85%] space-y-2 pt-1 pl-1">
                  <div className="flex items-center justify-between text-xs text-[#6E6B5F] px-1">
                    <span className="font-semibold text-[#1C1B18]">
                      Found {msg.matches.length} candidate {msg.matches.length === 1 ? 'match' : 'matches'}:
                    </span>
                  </div>
                  {msg.matches.map((match) => (
                    <AiMatchCard
                      key={match.found_item_id}
                      match={match}
                      onViewDetails={handleViewMatchDetails}
                    />
                  ))}
                </div>
              )}

              {/* Zero-Match CTA Callout */}
              {msg.action === 'search_results' && (!msg.matches || msg.matches.length === 0) && (
                <div className="w-full max-w-[88%] sm:max-w-[80%] bg-[#F2E8E2]/60 border border-[#E8D4C8] rounded-xl p-3.5 space-y-2 mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#C96442]">
                    <FileText className="w-4 h-4" />
                    <span>Item not in found inventory yet?</span>
                  </div>
                  <p className="text-xs text-[#4A473F] leading-relaxed">
                    Submit an official lost report so our automated match system instantly notifies you as soon as someone turns it in.
                  </p>
                  <button
                    type="button"
                    onClick={() => onStartReportWithSpecs?.(msg.extracted)}
                    className="w-full py-2 px-3 bg-[#C96442] hover:bg-[#A74E31] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>File Official Lost Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span className="text-[10px] text-[#A8A49A] px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-white border border-[rgba(0,0,0,0.07)] rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-2 text-xs text-[#6E6B5F]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C96442] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-[#C96442] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#C96442] animate-bounce" />
              </div>
              <span>Searching campus found items &amp; ranking candidates...</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => handleSend()}
              className="text-xs font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts (shown when only initial welcome message exists) */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 py-2.5 bg-white border-t border-[rgba(0,0,0,0.05)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-[#A8A49A] whitespace-nowrap pr-1">
            Try asking:
          </span>
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-xs text-[#4A473F] bg-[#FAF8F3] hover:bg-[#F2E8E2] hover:text-[#C96442] px-3 py-1.5 rounded-full border border-[rgba(0,0,0,0.08)] whitespace-nowrap transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 bg-white border-t border-[rgba(0,0,0,0.07)] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your lost item (e.g., brand, color, location)..."
            disabled={isLoading}
            className="flex-1 min-h-[44px] px-4 py-2.5 text-sm text-[#1C1B18] placeholder:text-[#A8A49A] bg-[#FAF8F3] border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:border-[#C96442] focus:ring-2 focus:ring-[#C96442]/15 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send search message"
            className="w-11 h-11 rounded-xl bg-[#C96442] hover:bg-[#A74E31] text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 disabled:hover:bg-[#C96442] shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Sub-bar with manual report fallback */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#A8A49A] px-1">
          <span>AI analyzes items without sharing photos</span>
          <button
            type="button"
            onClick={() => onStartReportWithSpecs?.(latestExtractedSpecs)}
            className="text-[#C96442] hover:underline font-medium"
          >
            File standard report →
          </button>
        </div>
      </div>

      {/* Item Detail Drawer for Claim Flow */}
      {selectedItem && (
        <ItemDetailDrawer
          isOpen={isDrawerOpen}
          item={selectedItem}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
}
