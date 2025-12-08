import React, { useEffect, useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';

export default function VoiceAgent({ agentId, staticPlan }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [urlParams, setUrlParams] = useState({ name: 'Guest', plan: 'Essential' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlParams({
        name: params.get('name') || 'Guest',
        plan: params.get('plan') || 'Essential',
      });
    }
  }, []);

  const conversation = useConversation({
    onConnect: () => console.log('Connected to YourHQ Assistant'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const { status, isSpeaking } = conversation;

  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      return true;
    } catch (err) {
      console.error('Mic permission denied:', err);
      alert('Please allow microphone access to do the interview.');
      return false;
    }
  };

  const toggleConversation = useCallback(async () => {
    if (status === 'connected') {
      await conversation.endSession();
    } else {
      const permitted = await requestMic();
      if (permitted) {
        await conversation.startSession({
          agentId: agentId,
          dynamicVariables: {
            user_name: urlParams.name,
            user_plan: staticPlan || urlParams.plan 
          }
        });
      }
    }
  }, [conversation, status, agentId, urlParams, staticPlan]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      
      {/* Status Bubble */}
      {status === 'connected' && (
        <div className="bg-white border-2 border-carbon px-4 py-2 shadow-hard mb-2 animate-fade-in">
            <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-signal animate-pulse' : 'bg-green-500'}`}></span>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-carbon">
                    {/* Updated Text */}
                    {isSpeaking ? 'Lian (AI) is speaking...' : 'Listening...'}
                </span>
            </div>
        </div>
      )}

      {/* The Button */}
      <button 
        onClick={toggleConversation}
        className={`
            flex items-center gap-3 px-6 py-4 border-2 border-carbon transition-all duration-200
            ${status === 'connected' 
                ? 'bg-hibiscus text-white shadow-none translate-y-[2px]' 
                : 'bg-signal text-white shadow-hard hover:shadow-none hover:translate-y-[2px]'}
        `}
      >
        {status === 'connected' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        )}
        
        <span className="font-bold uppercase tracking-widest">
            {status === 'connected' ? 'End Interview' : 'Start Interview'}
        </span>
      </button>
    </div>
  );
}