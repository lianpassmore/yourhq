import React, { useEffect, useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';

export default function VoiceAgent({ agentId, staticPlan, staticName }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [urlParams, setUrlParams] = useState({ name: '', plan: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlParams({
        name: params.get('name') || params.get('customer_name') || staticName || '',
        plan: params.get('plan') || params.get('package') || staticPlan || '',
      });
    }
  }, [staticName, staticPlan]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to YourHQ Assistant');
    },
    onDisconnect: () => {
      console.log('Disconnected from YourHQ Assistant');
      setHasPermission(false);
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('VoiceAgent Error:', error);
      setHasPermission(false);
    },
  });

  const { status, isSpeaking } = conversation;

  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      return true;
    } catch (err) {
      console.error('Mic permission denied:', err);
      alert('Please allow microphone access to start the interview.');
      return false;
    }
  };

  const toggleConversation = useCallback(async () => {
    // Prevent rapid clicks
    if (status === 'connecting' || status === 'disconnecting') {
      console.log('Connection in progress, please wait...');
      return;
    }

    if (status === 'connected') {
      try {
        await conversation.endSession();
      } catch (error) {
        console.error('Error ending session:', error);
      } finally {
        setHasPermission(false);
      }
    } else {
      const permitted = await requestMic();
      if (permitted) {
        try {
          console.log('Starting session with agent ID:', agentId);
          await conversation.startSession({
            agentId: agentId,
          });
          console.log('Session started successfully');
        } catch (error) {
          console.error('Failed to start session:', error);
          alert('Failed to connect to the voice agent. Please check your internet connection and try again.');
          setHasPermission(false);
        }
      }
    }
  }, [conversation, status, agentId]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 max-w-[calc(100vw-1rem)]">
      
      {/* Status Bubble */}
      {status === 'connected' && (
        <div className="bg-white rounded-full border border-carbon/10 px-4 py-2 shadow-elegant mb-2 animate-fade-in">
            <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-signal animate-pulse' : 'bg-deepGreen'}`}></span>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-carbon">
                    {isSpeaking ? 'Lian (AI) is speaking...' : 'Listening...'}
                </span>
            </div>
        </div>
      )}

      {/* The Button */}
      <button
        onClick={toggleConversation}
        className={`
            flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-full transition-colors duration-300
            ${status === 'connected'
                ? 'bg-terracotta text-white shadow-subtle hover:bg-terracotta/90'
                : 'bg-carbon text-white shadow-subtle hover:bg-deepGreen hover:shadow-elegant'}
        `}
      >
        {status === 'connected' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        )}

        <span className="font-medium text-sm sm:text-ui">
            {status === 'connected' ? 'End Interview' : 'Start Interview'}
        </span>
      </button>
    </div>
  );
}