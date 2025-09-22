import { NextRequest } from 'next/server';

export function checkUploadAuth(request: NextRequest) {
  const authCookie = request.cookies.get('upload-auth');
  return authCookie && authCookie.value === 'authenticated';
}

export function requireUploadAuth(request: NextRequest) {
  if (!checkUploadAuth(request)) {
    return {
      error: 'Authentication required',
      status: 401
    };
  }
  return null;
}
