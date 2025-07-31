"""Database package for the Enhanced Telegram Bot"""

from .database import (
    init_database,
    get_user,
    create_user,
    verify_user,
    update_user_activity,
    add_user_warning,
    mute_user,
    unmute_user,
    is_user_muted,
    get_faq_answer,
    get_all_faq,
    add_faq,
    get_random_quiz_questions,
    save_quiz_result,
    get_user_count,
    save_feedback,
    add_content,
    get_content_by_category
)

__all__ = [
    'init_database',
    'get_user',
    'create_user',
    'verify_user',
    'update_user_activity',
    'add_user_warning',
    'mute_user',
    'unmute_user',
    'is_user_muted',
    'get_faq_answer',
    'get_all_faq',
    'add_faq',
    'get_random_quiz_questions',
    'save_quiz_result',
    'get_user_count',
    'save_feedback',
    'add_content',
    'get_content_by_category'
]