from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class ReadingSession(Base):
    __tablename__ = 'reading_sessions'

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=True)  # For future user authentication
    document_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    segments = Column(JSON, nullable=False)  # Store text segments
    current_segment = Column(Integer, default=0)
    current_position = Column(Integer, default=0)
    bookmarks = Column(JSON, default=lambda: [])
    voice_id = Column(String, default='en-US-JennyNeural')
    reading_speed = Column(Float, default=1.0)
    font_size = Column(Integer, default=16)
    dark_mode = Column(Boolean, default=False)
    offline_mode = Column(Boolean, default=False)
    cached_audio_paths = Column(JSON, default=lambda: {})
    created_at = Column(DateTime, default=datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'document_name': self.document_name,
            'current_segment': self.current_segment,
            'current_position': self.current_position,
            'bookmarks': self.bookmarks,
            'voice_id': self.voice_id,
            'reading_speed': self.reading_speed,
            'font_size': self.font_size,
            'dark_mode': self.dark_mode,
            'offline_mode': self.offline_mode,
            'total_segments': len(self.segments),
            'created_at': self.created_at.isoformat(),
            'last_accessed': self.last_accessed.isoformat()
        }

class Bookmark(Base):
    __tablename__ = 'bookmarks'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    position = Column(Integer, nullable=False)
    segment_index = Column(Integer, nullable=False)
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'position': self.position,
            'segment_index': self.segment_index,
            'note': self.note,
            'created_at': self.created_at.isoformat()
        }
