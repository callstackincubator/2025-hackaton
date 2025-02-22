"use client";
import React from "react";
import { ReactMediaRecorder } from "react-media-recorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VoiceRecorder() {
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
    <Card className="p-6 max-w-md mx-auto mt-10 shadow-xl">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Record and Upload Voice</h2>
        <ReactMediaRecorder
          audio
          render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
            <div className="space-y-4">
              <p className="text-gray-600">Status: {status}</p>
              <Button onClick={startRecording} disabled={uploading}>
                Start Recording
              </Button>
              <Button onClick={stopRecording} disabled={uploading}>
                Stop Recording
              </Button>
              {mediaBlobUrl && (
                <div>
                  <audio src={mediaBlobUrl} controls className="mt-2" />
                  <Button
                    onClick={() => uploadToElevenLabs(mediaBlobUrl)}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload Voice"}
                  </Button>
                </div>
              )}
              {voiceId && (
                <p className="text-green-600 mt-2">Voice ID: {voiceId}</p>
              )}
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
