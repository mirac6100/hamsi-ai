import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class HamsiAI:
    def __init__(self, session_id: str, mode: str = "casual"):
        self.session_id = session_id
        self.mode = mode
        self.api_key = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-8E7144d8c96860d726')
        
        # System messages for different modes in Turkish
        self.system_messages = {
            "casual": "Sen Hamsi AI'sın, Türkiye'ye özel samimi bir yapay zeka asistanısın. Kullanıcılarla rahat ve samimi bir şekilde konuş. Türk kültürü, gelenekleri, yemekleri ve günlük yaşam hakkında bilgin var. Dostane ve yardımsever ol.",
            "formal": "Sen Hamsi AI'sın, Türkiye'ye özel profesyonel bir yapay zeka asistanısın. Kullanıcılarla resmi ve profesyonel bir dilde iletişim kur. Türk kültürü, tarihi ve iş dünyası hakkında bilgin var. Saygılı ve detaylı yanıtlar ver.",
            "professional": "Sen Hamsi AI'sın, Türkiye'ye özel teknik bir yapay zeka asistanısın. Detaylı, teknik ve açıklayıcı yanıtlar ver. Türkiye'deki teknoloji, bilim ve profesyonel konular hakkında derinlemesine bilgi paylaş. Analitik ve kapsamlı ol."
        }
        
        # Create chat instance
        self.chat = LlmChat(
            api_key=self.api_key,
            session_id=self.session_id,
            system_message=self.system_messages.get(mode, self.system_messages["casual"])
        ).with_model("gemini", "gemini-2.0-flash")
        
        logger.info(f"HamsiAI initialized with session_id: {session_id}, mode: {mode}")
    
    async def send_message(self, user_message: str) -> str:
        """Send a message to the AI and get response"""
        try:
            message = UserMessage(text=user_message)
            response = await self.chat.send_message(message)
            logger.info(f"AI response generated for session: {self.session_id}")
            return response
        except Exception as e:
            logger.error(f"Error sending message to AI: {str(e)}")
            raise
    
    async def get_messages(self):
        """Get conversation history"""
        try:
            return await self.chat.get_messages()
        except Exception as e:
            logger.error(f"Error getting messages: {str(e)}")
            return []