# Hamsi AI - Backend Integration Contracts

## API Contracts

### 1. Create New Session
**Endpoint:** `POST /api/sessions`
**Request Body:**
```json
{
  "mode": "casual" | "formal" | "professional"
}
```
**Response:**
```json
{
  "session_id": "uuid",
  "mode": "casual",
  "created_at": "timestamp"
}
```

### 2. Send Message
**Endpoint:** `POST /api/chat`
**Request Body:**
```json
{
  "session_id": "uuid",
  "message": "string",
  "mode": "casual" | "formal" | "professional",
  "file_id": "uuid (optional)"
}
```
**Response:**
```json
{
  "user_message": {
    "id": "uuid",
    "role": "user",
    "content": "string",
    "timestamp": "timestamp"
  },
  "assistant_message": {
    "id": "uuid",
    "role": "assistant",
    "content": "string",
    "timestamp": "timestamp"
  }
}
```

### 3. Get Chat History
**Endpoint:** `GET /api/sessions/{session_id}/messages`
**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "role": "user" | "assistant",
      "content": "string",
      "timestamp": "timestamp",
      "file_id": "uuid (optional)"
    }
  ]
}
```

### 4. Upload File
**Endpoint:** `POST /api/upload`
**Request:** multipart/form-data with file
**Response:**
```json
{
  "file_id": "uuid",
  "filename": "string",
  "size": number,
  "type": "string"
}
```

## Mock Data to Replace

**File:** `/app/frontend/src/mock.js`
- `mockConversations` → Remove, use API data
- `mockModes` → Keep (static data)
- `generateMockResponse()` → Remove, use real API

## Backend Implementation Plan

### Database Models (MongoDB)

1. **Session Model:**
   - `_id`: ObjectId
   - `session_id`: String (UUID)
   - `mode`: String (casual/formal/professional)
   - `created_at`: DateTime

2. **Message Model:**
   - `_id`: ObjectId
   - `message_id`: String (UUID)
   - `session_id`: String (UUID)
   - `role`: String (user/assistant)
   - `content`: String
   - `timestamp`: DateTime
   - `file_id`: String (optional)

3. **File Model:**
   - `_id`: ObjectId
   - `file_id`: String (UUID)
   - `filename`: String
   - `file_path`: String
   - `size`: Number
   - `mime_type`: String
   - `uploaded_at`: DateTime

### AI Integration

**Library:** emergentintegrations
**Provider:** Google Gemini
**Model:** gemini-2.0-flash
**Key:** EMERGENT_LLM_KEY

**System Messages by Mode:**
- **casual:** "Sen Hamsi AI'sın, Türkiye'ye özel samimi bir yapay zeka asistanısın. Kullanıcılarla rahat ve samimi bir şekilde konuş."
- **formal:** "Sen Hamsi AI'sın, Türkiye'ye özel profesyonel bir yapay zeka asistanısın. Kullanıcılarla resmi ve profesyonel bir dilde iletişim kur."
- **professional:** "Sen Hamsi AI'sın, Türkiye'ye özel teknik bir yapay zeka asistanısın. Detaylı, teknik ve açıklayıcı yanıtlar ver."

### File Upload Strategy
- Store files in `/app/backend/uploads/` directory
- Generate unique file_id (UUID)
- Save file metadata to MongoDB
- For image files, encode to base64 for Gemini (if needed)

## Frontend Integration Changes

### Files to Update:

1. **/app/frontend/src/pages/HomePage.jsx**
   - Remove mock data imports
   - Add API calls using axios
   - Use session_id for conversations
   - Replace `generateMockResponse()` with API call
   - Handle file upload to backend

### API Integration Pattern:

```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create session on mount
useEffect(() => {
  createSession();
}, []);

// Send message to backend
const handleSendMessage = async () => {
  const response = await axios.post(`${API}/chat`, {
    session_id: currentSession,
    message: inputMessage,
    mode: selectedMode
  });
  // Handle response
};
```

## Testing Checklist

- [ ] Create new session
- [ ] Send message in casual mode
- [ ] Send message in formal mode
- [ ] Send message in professional mode
- [ ] Upload file
- [ ] Retrieve chat history
- [ ] Multi-turn conversation
- [ ] Turkish language responses
- [ ] Mode switching during conversation
