'use client';

import { Settings } from 'lucide-react';
import { ReactMediaRecorder } from "react-media-recorder";
import { Button } from "@/components/ui/button";
import React from "react";

export default function SettingsPage() {
  const [voiceId, setVoiceId] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  const uploadToElevenLabs = async (blobUrl: any) => {
    setUploading(true);
    try {
      const blobResponse = await fetch(blobUrl);
      const blob = await blobResponse.blob();
      const formData = new FormData();
      formData.append("name", "my-voice");
      formData.append("file", blob, "voice_sample.wav");

      const response = await fetch("/api/add-voice", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setVoiceId(data.voice_id);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-8">
        <Settings className="w-8 h-8 text-purple-500" />
        <h1 className="text-2xl font-semibold text-purple-200">Settings</h1>
      </div>

      {/* About Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium">About Mirror.ai</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Mirror.ai is your personal AI assistant that helps you understand yourself better through meaningful conversations and memory tracking. We use advanced AI to create a comprehensive understanding of who you are.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-medium mb-2">Memory System</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Our unique memory system categorizes and stores important details about you, helping create more personalized interactions over time.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-medium mb-2">AI Models</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Powered by state-of-the-art language models to provide intelligent, context-aware responses and insights.
            </p>
          </div>
        </div>
      </section>

      {/* Voice Settings Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium">Custom Voice Settings</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Personalize your interaction by adding a custom voice for Mirror.ai responses.
        </p>
        
        <div className="p-6 rounded-lg border bg-card">
          <ReactMediaRecorder
            audio
            render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  Status: {status}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={startRecording} 
                    disabled={uploading || status === 'recording'}
                    variant={status === 'recording' ? 'destructive' : 'default'}
                  >
                    Start Recording
                  </Button>
                  <Button 
                    onClick={stopRecording} 
                    disabled={uploading || status !== 'recording'}
                  >
                    Stop Recording
                  </Button>
                </div>

                {mediaBlobUrl && (
                  <div className="space-y-3">
                    <audio src={mediaBlobUrl} controls className="w-full" />
                    <Button
                      onClick={() => uploadToElevenLabs(mediaBlobUrl)}
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? "Uploading..." : "Upload Voice"}
                    </Button>
                  </div>
                )}
                
                {voiceId && (
                  <p className="text-sm text-green-600">
                    Voice ID: {voiceId}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </section>

      {/* Version Info */}
      <section className="pt-8 border-t">
        <p className="text-sm text-gray-500">
          Mirror.ai Version (v0)
        </p>
      </section>
    </div>
  );
} 