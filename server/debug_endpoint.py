"""Debug logging utility to trace video endpoint execution"""
import datetime

DEBUG_LOG_FILE = "d:/higgs/server/video_endpoint_debug.log"

def log_debug(message: str):
    """Append debug message to log file with timestamp"""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
    with open(DEBUG_LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")
        f.flush()
