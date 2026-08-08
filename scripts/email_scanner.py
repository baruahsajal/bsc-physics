import imaplib
import email
import json
import os
import re
from datetime import datetime

def run_ledger_sync():
    print("Initiating Mainframe Ledger Sync...")

    # 1. Securely fetch credentials from GitHub Secrets
    email_user = os.environ.get("EMAIL_ADDRESS")
    email_pass = os.environ.get("EMAIL_APP_PASSWORD")

    if not email_user or not email_pass:
        print("[ERROR] Missing email credentials in environment variables.")
        return

    # 2. Define the path to the database file
    db_path = os.path.join(os.path.dirname(__file__), '../database/payment_history.json')

    # Load existing databank
    try:
        with open(db_path, 'r') as file:
            ledger = json.load(file)
    except Exception as e:
        print(f"[ERROR] Could not read database: {e}")
        ledger = []

    # 3. Connect to the IMAP Server (Gmail configuration)
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(email_user, email_pass)
        mail.select("inbox")

        # Search for UNREAD emails with "Payment" in the subject
        status, messages = mail.search(None, '(UNREAD SUBJECT "Payment")')
        email_ids = messages[0].split()

        new_entries = 0

        for e_id in email_ids:
            # Fetch the email
            _, msg_data = mail.fetch(e_id, '(RFC822)')
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])

                    # Extract text payload
                    if msg.is_multipart():
                        payload = msg.get_payload(0).get_payload(decode=True).decode()
                    else:
                        payload = msg.get_payload(decode=True).decode()

                    # UPGRADED REGEX: Extracts Amount, Uppercase Name, and Code
                    # Expected email body format: "Received ₹500 from PRANKU KURMI [PK9]"
                    amount_match = re.search(r'₹(\d+)', payload)
                    name_match = re.search(r'from\s+([A-Z\s]+)\s*\[', payload)
                    id_match = re.search(r'\[([A-Z0-9]+)\]', payload)

                    if amount_match and name_match and id_match:
                        name = name_match.group(1).strip()
                        amount = int(amount_match.group(1))
                        student_id = id_match.group(1).strip()

                        ledger.append({
                            "id": student_id, 
                            "name": name,
                            "amount": amount,
                            "date": datetime.now().strftime("%Y-%m-%d"),
                            "status": "Verified"
                        })
                        new_entries += 1

            # Mark email as read after processing
            mail.store(e_id, '+FLAGS', '\\Seen')

        # 4. Save the updated databank back to the repository
        if new_entries > 0:
            with open(db_path, 'w') as file:
                json.dump(ledger, file, indent=4)
            print(f"[SUCCESS] Appended {new_entries} new transactions to the ledger.")
        else:
            print("[INFO] No new transactions detected in the network.")

    except Exception as e:
        print(f"[CRITICAL ERROR] IMAP connection or parsing failed: {e}")

if __name__ == "__main__":
    run_ledger_sync()
