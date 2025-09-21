'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-crossword', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Upload error:', error);
      setResult({ error: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload WSJ Crossword</h1>
          <p className="text-gray-600">Upload a PDF of the WSJ crossword puzzle to extract answers automatically</p>
        </div>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {file ? file.name : 'Click to select PDF file'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop your WSJ crossword PDF here, or click to browse
              </p>
            </label>
          </div>

          {/* Upload Button */}
          <div className="text-center">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Processing...' : 'Upload & Extract Answers'}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8">
              {result.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">Error: {result.error}</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Success!</h3>
                  <p className="text-green-700">
                    Found {result.answers?.length || 0} crossword answers
                  </p>
                  {result.answers && result.answers.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-green-600 mb-2">Sample answers:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {result.answers.slice(0, 6).map((answer: any, index: number) => (
                          <div key={index} className="bg-white p-2 rounded border text-sm">
                            <span className="font-medium">{answer.position}:</span> {answer.answer}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How to use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Go to the WSJ puzzles page and find today's crossword</li>
            <li>Look for a "Download PDF" or "Print" option</li>
            <li>Download the PDF file to your computer</li>
            <li>Upload the PDF using the form above</li>
            <li>The system will automatically extract all answers using AI</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
