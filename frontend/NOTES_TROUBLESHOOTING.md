# Notes Connection Issues - Troubleshooting Guide

## Problem Description
Users are experiencing connection errors when trying to access notes after selecting a subject:
- "Unable to connect to server: The string did not match the expected pattern"
- "Oops! Something went wrong"

## Root Causes Identified

### 1. URL Construction Issues
- The `buildApiUrl` utility function was creating malformed URLs
- Special characters in class/subject names weren't properly encoded
- URL validation was failing due to improper parameter handling

### 2. API Endpoint Mismatch
- The primary endpoint `/learn/notes` might not match what the backend expects
- Multiple fallback endpoints are now tried in sequence

### 3. Error Handling
- Generic error messages didn't provide enough information to diagnose issues
- Network connectivity wasn't being tested before making requests

## Fixes Implemented

### 1. Improved URL Construction
- Replaced `buildApiUrl` with manual URL construction using `URLSearchParams`
- Added proper parameter encoding for special characters
- Added URL validation before making requests

### 2. Fallback Endpoint System
- Added multiple endpoint attempts:
  - Primary: `/learn/notes`
  - Fallback 1: `/learn/note`
  - Fallback 2: `/learn/content`
  - Fallback 3: `/learn/learn`

### 3. Enhanced Error Handling
- Added specific error messages for different HTTP status codes
- Added network connectivity testing
- Improved error categorization (network, URL, authentication, etc.)

### 4. Better Debugging
- Added comprehensive logging throughout the process
- Added API connectivity testing
- Added detailed error reporting

## How to Test

1. **Check Browser Console**: Open developer tools and look for debug messages starting with `🔍 [SELECT_SUBJECT DEBUG]`

2. **Test API Connectivity**: The app now tests connectivity to multiple endpoints before making requests

3. **Check Network Tab**: Look for failed requests and their specific error messages

## Environment Variables

Make sure these environment variables are properly set:
```bash
VITE_LEARNING_API_BASE_URL=https://your-api-server.com
VITE_API_BASE_URL=https://your-api-server.com
VITE_EXAM_API_BASE_URL=https://your-api-server.com
```

## Common Issues and Solutions

### Issue: "The string did not match the expected pattern"
**Solution**: This usually indicates a URL validation error. The app now:
- Validates URLs before making requests
- Uses proper parameter encoding
- Provides fallback endpoints

### Issue: "Unable to connect to server"
**Solution**: This indicates a network connectivity problem. The app now:
- Tests connectivity before making requests
- Provides specific network error messages
- Tries multiple endpoints

### Issue: "Authentication failed"
**Solution**: Check that:
- User is properly logged in
- Token is valid and not expired
- Token format is correct

## Debugging Steps

1. **Check Console Logs**: Look for debug messages to understand where the failure occurs
2. **Check Network Tab**: See the actual HTTP requests and responses
3. **Test API Directly**: Try accessing the API endpoints directly in a browser or with curl
4. **Check Environment Variables**: Ensure API URLs are correctly configured

## Files Modified

- `src/components/Forms/SelectSubject.jsx` - Main fixes for URL construction and error handling
- `src/components/Notes/ShowNotesComponent/ShowNotes.jsx` - Improved error handling
- `src/config.js` - Added URL validation and debugging

## Next Steps

If issues persist:
1. Check the backend API to ensure endpoints are working
2. Verify the API base URLs are correct
3. Test with different subjects/chapters
4. Check if the backend expects different parameter names or formats
