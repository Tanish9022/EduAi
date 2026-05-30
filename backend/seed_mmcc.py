import os
import sys

# Add the backend directory to python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database.connection import SessionLocal
from app.models.models import College, User
from app.core import security

def seed():
    db = SessionLocal()
    try:
        # Check if MMCC college already exists
        mmcc_college = db.query(College).filter(College.slug == "mmcc").first()
        if not mmcc_college:
            print("Creating MMCC College...")
            mmcc_college = College(
                name="Marathwada Mitra Mandal's College of Commerce",
                slug="mmcc",
                email="admin@mmcc.edu.in",
                subscription_plan="premium"
            )
            db.add(mmcc_college)
            db.flush() # get id
        else:
            print("MMCC College already exists.")

        # Check if admin user exists
        admin_user = db.query(User).filter(User.email == "admin@mmcc.edu.in").first()
        if not admin_user:
            print("Creating Admin User for MMCC...")
            admin_user = User(
                college_id=mmcc_college.id,
                name="MMCC Admin",
                email="admin@mmcc.edu.in",
                hashed_password=security.get_password_hash("password123"),
                role="college_admin",
                is_active=True
            )
            db.add(admin_user)
        else:
            print("Admin User already exists.")

        db.commit()
        print("Successfully seeded MMCC database records!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
