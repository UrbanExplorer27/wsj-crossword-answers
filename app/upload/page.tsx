'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadType, setUploadType] = useState<'pdf' | 'text'>('pdf');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setResult(null);
  };

  const handleUpload = async () => {
    if (uploadType === 'pdf' && !file) return;
    if (uploadType === 'text' && !text.trim()) return;

    setUploading(true);
    setResult(null);

    try {
      let response;
      
      if (uploadType === 'pdf') {
        const formData = new FormData();
        formData.append('file', file!);
        response = await fetch('/api/upload-crossword', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/upload-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
      }

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (error) {
      setResult({ error: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Crossword</h1>
          <p className="text-gray-600">Upload a PDF or paste text to get answers instantly</p>
        </div>

        <div className="space-y-6">
          {/* Upload Type Toggle */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setUploadType('pdf')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadType === 'pdf'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              PDF Upload
            </button>
            <button
              onClick={() => setUploadType('text')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadType === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Text Paste
            </button>
          </div>

          {/* PDF Upload */}
          {uploadType === 'pdf' && (
            <div className="text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-green-600">✓ {file.name}</p>
              )}
            </div>
          )}

          {/* Text Upload */}
          {uploadType === 'text' && (
            <div>
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your crossword text here... (clues, answers, grid, etc.)"
                className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                {text.length} characters
              </p>
            </div>
          )}

          {/* Upload Button */}
          <div className="text-center">
            <button
              onClick={handleUpload}
              disabled={(uploadType === 'pdf' && !file) || (uploadType === 'text' && !text.trim()) || uploading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Processing...' : 'Get Answers'}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6">
              {result.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-800">❌ {result.error}</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 mb-2">✅ Found {result.answers?.length || 0} answers!</p>
                  <p className="text-sm text-green-600">Redirecting to main page...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
