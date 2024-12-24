from flask import Flask, jsonify, request
from flask_cors import CORS
from .models.session import Base
from sqlalchemy import create_engine
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    
    # Initialize database
    engine = create_engine('sqlite:///readit.db')
    Base.metadata.create_all(engine)

    # Register blueprints
    from .routes import main_bp
    app.register_blueprint(main_bp)  # Remove url_prefix to match frontend calls

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200

    @app.errorhandler(404)
    def not_found_error(error):
        logger.error(f"404 Error: {error}")
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested URL was not found on the server',
            'status': 404
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 Error: {error}")
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(error),
            'status': 500
        }), 500

    @app.before_request
    def log_request_info():
        logger.debug('Headers: %s', request.headers)
        logger.debug('Body: %s', request.get_data())

    return app
