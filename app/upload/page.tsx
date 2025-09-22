'use client';

import { useState, useEffect } from 'react';

export default function UploadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadType, setUploadType] = useState<'pdf' | 'text' | 'image' | 'answers' | 'solved'>('image');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/check-auth');
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setAuthError('Incorrect password. Please try again.');
      }
    } catch (error) {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

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
    if ((uploadType === 'pdf' || uploadType === 'image' || uploadType === 'solved') && !file) return;
    if ((uploadType === 'text' || uploadType === 'answers') && !text.trim()) return;

    console.log('🚀 Upload type:', uploadType);
    console.log('🚀 Text content:', JSON.stringify(text));
    console.log('🚀 Text length:', text.length);
    console.log('🚀 Text trimmed:', text.trim().length);

    setUploading(true);
    setResult(null);

    try {
      let response;
      
      if (uploadType === 'pdf') {
        const formData = new FormData();
        formData.append('file', file!);
        formData.append('date', selectedDate);
        response = await fetch('/api/upload-crossword', {
          method: 'POST',
          body: formData,
        });
      } else if (uploadType === 'image') {
        const formData = new FormData();
        formData.append('file', file!);
        formData.append('date', selectedDate);
        response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
      } else if (uploadType === 'solved') {
        const formData = new FormData();
        formData.append('file', file!);
        formData.append('date', selectedDate);
        response = await fetch('/api/upload-solved', {
          method: 'POST',
          body: formData,
        });
      } else if (uploadType === 'text') {
        response = await fetch('/api/upload-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, date: selectedDate }),
        });
      } else { // uploadType === 'answers'
        response = await fetch('/api/upload-answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, date: selectedDate }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Upload failed:', response.status, errorData);
        throw new Error(`Upload failed: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('✅ Upload successful:', data);
      setResult(data);
      
      if (data.success) {
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setResult({ error: error instanceof Error ? error.message : 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Access Restricted</h1>
            <p className="text-sm sm:text-base text-gray-600">Please enter the password to access the upload page</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isChecking || !password.trim()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isChecking ? 'Verifying...' : 'Access Upload Page'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show upload form if authenticated
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Upload Crossword</h1>
          <p className="text-sm sm:text-base text-gray-600">Upload an image, PDF, paste text, enter answers, or upload solved crossword</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Upload Type Toggle */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2 mb-4 sm:mb-6">
            <button
              onClick={() => setUploadType('image')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                uploadType === 'image'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Image
            </button>
            <button
              onClick={() => setUploadType('pdf')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                uploadType === 'pdf'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => setUploadType('text')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                uploadType === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setUploadType('answers')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                uploadType === 'answers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Answers
            </button>
            <button
              onClick={() => setUploadType('solved')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                uploadType === 'solved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Solved
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
              Select Date:
            </label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
            />
          </div>

          {/* Image Upload */}
          {uploadType === 'image' && (
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-green-600">✓ {file.name}</p>
              )}
            </div>
          )}

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

          {/* Answers Upload */}
          {uploadType === 'answers' && (
            <div>
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your answers here in this format:
1A: FASTEN
2D: LOTION
3A: CAMDEN
4D: MEASLY
...

Or any format with clue numbers and answers"
                className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                {text.length} characters
              </p>
              <p className="mt-1 text-xs text-gray-400 text-center">
                Format: Position: Answer (e.g., 1A: FASTEN)
              </p>
            </div>
          )}

          {/* Solved Image Upload */}
          {uploadType === 'solved' && (
            <div className="text-center">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Solved Crossword</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload an image of the completed crossword puzzle. We'll extract both the clues and answers to create individual answer pages.
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {file && (
                <p className="mt-2 text-sm text-green-600">✓ {file.name}</p>
              )}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Make sure the image shows both the crossword grid with filled answers AND the clue list clearly visible.
                </p>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="text-center">
            <button
              onClick={handleUpload}
              disabled={((uploadType === 'pdf' || uploadType === 'image' || uploadType === 'solved') && !file) || ((uploadType === 'text' || uploadType === 'answers') && !text.trim()) || uploading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Processing...' : uploadType === 'answers' ? 'Upload Answers' : 'Get Answers'}
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
