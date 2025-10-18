from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import shutil
import uuid
from datetime import datetime
from typing import List

from models import (
    SessionCreate, Session, MessageCreate, Message, MessageResponse,
    ChatResponse, FileUpload, FileResponse
)
from ai_service import HamsiAI

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Store active AI instances
active_chats = {}

@api_router.get("/")
async def root():
    return {"message": "Hamsi AI Backend - Türkiye'nin yapay zeka asistanı"}

@api_router.post("/sessions", response_model=Session)
async def create_session(session_data: SessionCreate):
    """Create a new chat session"""
    try:
        session = Session(
            mode=session_data.mode,
            created_at=datetime.utcnow()
        )
        
        # Save to database
        await db.sessions.insert_one(session.dict())
        
        # Initialize AI chat for this session
        active_chats[session.session_id] = HamsiAI(
            session_id=session.session_id,
            mode=session.mode
        )
        
        logger.info(f"Created new session: {session.session_id}")
        return session
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chat", response_model=ChatResponse)
async def chat(message_data: MessageCreate):
    """Send a message and get AI response"""
    try:
        # Check if session exists
        session = await db.sessions.find_one({"session_id": message_data.session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get or create AI chat instance
        if message_data.session_id not in active_chats:
            active_chats[message_data.session_id] = HamsiAI(
                session_id=message_data.session_id,
                mode=message_data.mode
            )
        
        ai_chat = active_chats[message_data.session_id]
        
        # Save user message
        user_message = Message(
            session_id=message_data.session_id,
            role="user",
            content=message_data.message,
            file_id=message_data.file_id
        )
        await db.messages.insert_one(user_message.dict())
        
        # Get AI response
        ai_response_text = await ai_chat.send_message(message_data.message)
        
        # Save assistant message
        assistant_message = Message(
            session_id=message_data.session_id,
            role="assistant",
            content=ai_response_text
        )
        await db.messages.insert_one(assistant_message.dict())
        
        # Format response
        return ChatResponse(
            user_message=MessageResponse(
                id=user_message.message_id,
                role=user_message.role,
                content=user_message.content,
                timestamp=user_message.timestamp.isoformat(),
                file_id=user_message.file_id
            ),
            assistant_message=MessageResponse(
                id=assistant_message.message_id,
                role=assistant_message.role,
                content=assistant_message.content,
                timestamp=assistant_message.timestamp.isoformat()
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    """Get all messages for a session"""
    try:
        messages = await db.messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(1000)
        
        return {
            "messages": [
                MessageResponse(
                    id=msg["message_id"],
                    role=msg["role"],
                    content=msg["content"],
                    timestamp=msg["timestamp"].isoformat(),
                    file_id=msg.get("file_id")
                )
                for msg in messages
            ]
        }
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload", response_model=FileResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload a file"""
    try:
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        file_path = UPLOADS_DIR / f"{file_id}{file_extension}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = file_path.stat().st_size
        
        # Save file metadata to database
        file_data = FileUpload(
            file_id=file_id,
            filename=file.filename,
            file_path=str(file_path),
            size=file_size,
            mime_type=file.content_type or "application/octet-stream"
        )
        await db.files.insert_one(file_data.dict())
        
        logger.info(f"File uploaded: {file.filename} ({file_id})")
        
        return FileResponse(
            file_id=file_id,
            filename=file.filename,
            size=file_size,
            type=file.content_type or "application/octet-stream"
        )
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    active_chats.clear()