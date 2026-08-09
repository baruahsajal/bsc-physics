import imaplib
import email
import json
import os
import re
import base64
from datetime import datetime

# --- ENCRYPTION ENGINE ---
def xor_cipher(data_bytes, pin_bytes):
    result = bytearray()
    for i in range(len(data_bytes)):
        result.append(data_bytes[i] ^ pin_bytes[i % len(pin_bytes)])
    return result

def encrypt_vault(data_string, pin):
    data_bytes = data_string.encode('utf-8')
    pin_bytes = pin.encode('utf-8')
    encrypted_bytes = xor_cipher(data_bytes, pin_bytes)
    return base64.b64encode(encrypted_bytes).decode('utf-8')

def decrypt_vault(encrypted_string, pin):
    try:
        encrypted_bytes = base64.b64decode(encrypted_string)
        pin_bytes = pin.encode('utf-8')
        decrypted_bytes = xor_cipher(encrypted_bytes, pin_bytes)
        return decrypted_bytes.decode('utf-8')
    except Exception:
        return None
# ------------------------

def run_ledger_sync():
    print("Initiating Encrypted Mainframe Ledger Sync...")

    # 1. Securely fetch credentials from GitHub Secrets
    email_user = os.environ.get("EMAIL_ADDRESS")
    email_pass = os.environ.get("EMAIL_APP_PASSWORD")
    vault_pin = os.environ.get("VAULT_PIN") # NEW: The secret encryption key

    if not email_user or not email_pass or not vault_pin:
        print("[ERROR] Missing credentials or VAULT_PIN in environment variables.")
        return

    # 2. Define the path to the database file
    db_path = os.path.join(os.path.dirname(__file__), '../database/payment_history.json')

    # Load existing databank and decrypt
    ledger = []
    raw_data = ""
    if os.path.exists(db_path):
        try:
            with open(db_path, 'r') as file:
                raw_data = file.read().strip()
            
            if raw_data:
                # If it looks like standard JSON, read it normally (Migration phase)
                if raw_data.startswith('['):
                    ledger = json.loads(raw_data)
                    print("[INFO] Unencrypted databank detected. Preparing for secure migration.")
                else:
                    # Otherwise, decrypt it using the VAULT_PIN
                    decrypted_data = decrypt_vault(raw_data, vault_pin)
                    ledger = json.loads(decrypted_data)
        except Exception as e:
            print(f"[ERROR] Could not read or decrypt database. Invalid PIN or corrupted file: {e}")
            ledger = []

    # 3. Connect to the IMAP Server
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(email_user, email_pass)
        mail.select("inbox")

        status, messages = mail.search(None, '(UNREAD SUBJECT "Payment")')
        email_ids = messages[0].split()

        new_entries = 0

        for e_id in email_ids:
            _, msg_data = mail.fetch(e_id, '(RFC822)')
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])

                    if msg.is_multipart():
                        payload = msg.get_payload(0).get_payload(decode=True).decode()
                    else:
                        payload = msg.get_payload(decode=True).decode()

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

            mail.store(e_id, '+FLAGS', '\\Seen')

        # 4. Encrypt and save the databank
        # We save if there are new entries OR if the file needs to be migrated to encrypted format
        if new_entries > 0 or raw_data.startswith('['):
            json_string = json.dumps(ledger, indent=4)
            encrypted_payload = encrypt_vault(json_string, vault_pin)
            
            with open(db_path, 'w') as file:
                file.write(encrypted_payload)
            print(f"[SUCCESS] Encrypted and saved {len(ledger)} total transactions to the secure vault.")
        else:
            print("[INFO] No new transactions detected in the network.")

    except Exception as e:
        print(f"[CRITICAL ERROR] IMAP connection or parsing failed: {e}")

if __name__ == "__main__":
    run_ledger_sync()
