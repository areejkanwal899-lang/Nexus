import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Maximize2 } from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({ isOpen, onClose, participantName }) => {
  if (!isOpen) return null;

  // Media Track states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Call timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl h-[75vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800 relative">
        
        {/* Top Header Row */}
        <div className="p-4 bg-slate-900/60 backdrop-blur border-b border-slate-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Secure WebRTC Connection
            </span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">
              {formatTime(callDuration)}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {/* Video Viewport Area */}
        <div className="flex-1 bg-slate-950 relative p-4 flex gap-4 min-h-0">
          
          {/* Main Remote Screen (The other participant) */}
          <div className="flex-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden relative shadow-inner">
            {isScreenSharing ? (
              <div className="absolute inset-0 bg-blue-950/20 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <Monitor size={64} className="text-blue-500 mb-3 animate-bounce" />
                <p className="text-white font-medium text-lg">You are sharing your screen</p>
                <p className="text-sm text-slate-400">Other participants can see everything on your view</p>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-md">
                  {participantName.charAt(0)}
                </div>
                <h4 className="text-white font-semibold text-lg">{participantName}</h4>
                <p className="text-sm text-slate-400 mt-1">Connecting media streams...</p>
              </div>
            )}
            
            {/* Absolute Label overlay */}
            <span className="absolute bottom-3 left-3 bg-slate-950/60 text-xs text-slate-300 px-2 py-1 rounded-md backdrop-blur">
              {isScreenSharing ? 'My Presentation Screen' : `${participantName}'s Stream`}
            </span>
          </div>

          {/* Local Feed Camera (Me - Pip Viewport) */}
          <div className="w-1/4 max-w-[200px] aspect-[3/4] self-end rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden relative shadow-lg z-10 mb-2">
            {isVideoOff ? (
              <div className="text-center p-2">
                <VideoOff size={24} className="text-slate-500 mx-auto mb-1" />
                <p className="text-[10px] text-slate-400 font-medium">Camera Off</p>
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-700 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1">
                  Me
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">Camera Streaming</p>
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-slate-950/70 text-[10px] text-slate-300 px-1.5 py-0.5 rounded">
              My Feed {isMuted && '🎤 Off'}
            </span>
          </div>
        </div>

        {/* Bottom Control Bars */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 flex justify-center items-center gap-4">
          
          {/* Mute Button */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition shadow-md border ${
              isMuted 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Video Toggle Button */}
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-3.5 rounded-full transition shadow-md border ${
              isVideoOff 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          {/* Optional Screen Share Toggle Button */}
          <button 
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3.5 rounded-full transition shadow-md border ${
              isScreenSharing 
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={isScreenSharing ? "Stop Presenting" : "Share Entire Screen"}
          >
            <Monitor size={20} />
          </button>

          {/* End Call Separator & Trigger */}
          <div className="w-[1px] h-6 bg-slate-800 mx-2" />

          <button 
            onClick={onClose}
            className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg flex items-center justify-center"
            title="Disconnect Call"
          >
            <PhoneOff size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};