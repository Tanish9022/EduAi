from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.notification_engine import notification_engine

scheduler = AsyncIOScheduler()

def start_scheduler():
    """
    Mount to FastAPI startup.
    Registers jobs with required intervals.
    """
    # 1. Generator: Every 30 minutes
    scheduler.add_job(
        notification_engine.generate_scheduled_notifications,
        'interval',
        minutes=30,
        id='generate_notifications_job',
        replace_existing=True
    )
    
    # 2. Processor: Every 1 minute
    scheduler.add_job(
        notification_engine.process_notification_queue,
        'interval',
        minutes=1,
        id='process_queue_job',
        replace_existing=True
    )
    
    scheduler.start()
    print("[Scheduler] Started APScheduler with Generator (30m) and Processor (1m)")

def stop_scheduler():
    scheduler.shutdown()
