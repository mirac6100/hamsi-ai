from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

# Session Models
class SessionCreate(BaseModel):
    mode: str = Field(default="casual")

class Session(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mode: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Message Models
class MessageCreate(BaseModel):
    session_id: str
    message: str
    mode: str
    file_id: Optional[str] = None

class Message(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    file_id: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    file_id: Optional[str] = None

class ChatResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse

# File Models
class FileUpload(BaseModel):
    file_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_path: str
    size: int
    mime_type: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class FileResponse(BaseModel):
    file_id: str
    filename: str
    size: int
    type: str