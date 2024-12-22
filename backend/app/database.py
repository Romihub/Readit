from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

Base = declarative_base()

class Session(Base):
    __tablename__ = 'sessions'

    id = Column(String, primary_key=True)
    text = Column(Text)
    current_position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.utcnow)

class SessionManager:
    def __init__(self):
        self.engine = create_engine('sqlite:///readit.db')
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.db_session = Session()

    def create_session(self, text):
        """Create a new reading session"""
        session_id = str(uuid.uuid4())
        session = Session(
            id=session_id,
            text=text,
            current_position=0
        )
        self.db_session.add(session)
        self.db_session.commit()
        return session_id

    def get_session(self, session_id):
        """Retrieve session information"""
        session = self.db_session.query(Session).filter_by(id=session_id).first()
        if not session:
            raise ValueError("Session not found")
        
        session.last_accessed = datetime.utcnow()
        self.db_session.commit()
        
        return {
            'id': session.id,
            'text': session.text,
            'current_position': session.current_position,
            'created_at': session.created_at.isoformat(),
            'last_accessed': session.last_accessed.isoformat()
        }

    def update_session(self, session_id, position):
        """Update session progress"""
        session = self.db_session.query(Session).filter_by(id=session_id).first()
        if not session:
            raise ValueError("Session not found")
        
        session.current_position = position
        session.last_accessed = datetime.utcnow()
        self.db_session.commit()

    def cleanup_old_sessions(self, days=7):
        """Remove sessions older than specified days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        self.db_session.query(Session).filter(
            Session.last_accessed < cutoff_date
        ).delete()
        self.db_session.commit()
