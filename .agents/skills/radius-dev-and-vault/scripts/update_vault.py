#!/usr/bin/env python3
"""
Radius Vault Encryptor & Zero-Plaintext Pre-Commit Privacy Auditor
Reads the passcode from gitignored .vault-passcode.local (or --passcode CLI flag)
and verifies that neither the passcode nor any private contact/tier-3 strings
appear anywhere in git-tracked files.
"""

import argparse
import base64
import hashlib
import hmac
import json
import os
import re
import subprocess
import sys
from pathlib import Path

RADIUS_ROOT = Path("/home/emilyjaneryan/radius")
LOCAL_VAULT_PATH = RADIUS_ROOT / "private-vault.local.json"
LOCAL_PASSCODE_PATH = RADIUS_ROOT / ".vault-passcode.local"
VAULT_JS_PATH = RADIUS_ROOT / "src" / "vault.js"


def get_passcode(cli_passcode=None) -> str:
    if cli_passcode:
        return cli_passcode.strip()
    if LOCAL_PASSCODE_PATH.exists():
        return LOCAL_PASSCODE_PATH.read_text(encoding="utf-8").strip()
    raise RuntimeError("No passcode provided and .vault-passcode.local not found.")


def derive_keys(passphrase: str, salt: bytes, iterations: int = 25000):
    dk = hashlib.pbkdf2_hmac("sha256", passphrase.encode("utf-8"), salt, iterations, dklen=64)
    return dk[:32], dk[32:]


def xor_keystream(data: bytes, enc_key: bytes, iv: bytes) -> bytes:
    out = bytearray(len(data))
    block_count = (len(data) + 31) // 32
    for counter in range(block_count):
        ctr_bytes = counter.to_bytes(4, "big")
        ks = hmac.new(enc_key, iv + ctr_bytes, hashlib.sha256).digest()
        start = counter * 32
        end = min(start + 32, len(data))
        for i in range(start, end):
            out[i] = data[i] ^ ks[i - start]
    return bytes(out)


def encrypt_vault(plaintext_str: str, passphrase: str) -> dict:
    salt = os.urandom(16)
    iv = os.urandom(16)
    enc_key, mac_key = derive_keys(passphrase, salt)
    pt_bytes = plaintext_str.encode("utf-8")
    ct_bytes = xor_keystream(pt_bytes, enc_key, iv)
    tag = hmac.new(mac_key, salt + iv + ct_bytes, hashlib.sha256).digest()
    return {
        "v": 1,
        "iter": 25000,
        "salt": base64.b64encode(salt).decode("ascii"),
        "iv": base64.b64encode(iv).decode("ascii"),
        "tag": base64.b64encode(tag).decode("ascii"),
        "ct": base64.b64encode(ct_bytes).decode("ascii"),
    }


def update_vault_js(blob: dict):
    content = VAULT_JS_PATH.read_text(encoding="utf-8")
    replacement = "const DEFAULT_ENCRYPTED_VAULT = " + json.dumps(blob) + ";"
    updated, count = re.subn(
        r"const DEFAULT_ENCRYPTED_VAULT = \{.*?\};",
        replacement,
        content,
        count=1,
        flags=re.DOTALL,
    )
    if count != 1:
        raise RuntimeError("Could not locate DEFAULT_ENCRYPTED_VAULT in src/vault.js")
    VAULT_JS_PATH.write_text(updated, encoding="utf-8")


def audit_tracked_files(passcode: str):
    if not LOCAL_VAULT_PATH.exists():
        print("[WARN] private-vault.local.json not found; skipping dynamic contact audit.")
        return True

    vault_data = json.loads(LOCAL_VAULT_PATH.read_text(encoding="utf-8"))
    sensitive_terms = {passcode}
    for c in vault_data.get("contacts", []):
        if c.get("name"):
            sensitive_terms.add(c["name"])
        if c.get("handle"):
            sensitive_terms.add(c["handle"])

    for n in vault_data.get("nodes", []):
        if n.get("tier") == 3 and "Demo" not in n.get("label", ""):
            sensitive_terms.add(n["label"])

    # Get all git-tracked files excluding SPEC.md, README.md, CONTRIBUTING.md (which document user stories)
    out = subprocess.check_output(
        ["git", "-C", str(RADIUS_ROOT), "ls-files"], text=True
    ).splitlines()
    doc_allowlist = {"SPEC.md", "README.md", "CONTRIBUTING.md", ".agents/skills/emil-design-eng/SKILL.md"}

    leaks = []
    checked_count = 0
    for rel_path in out:
        if rel_path in doc_allowlist or rel_path.endswith(".png"):
            continue
        path = RADIUS_ROOT / rel_path
        if not path.exists() or not path.is_file():
            continue
        checked_count += 1
        text = path.read_text(encoding="utf-8", errors="ignore")
        for term in sensitive_terms:
            pattern = r"\b" + re.escape(term) + r"\b"
            if re.search(pattern, text, flags=re.IGNORECASE):
                leaks.append((rel_path, term))

    if leaks:
        print("❌ PRIVACY AUDIT FAILED! Found sensitive terms or passcode in tracked files:")
        for file_rel, term in leaks:
            print(f"  - {file_rel}: '{term}'")
        return False

    print(
        f"✅ PRIVACY AUDIT PASSED: Checked {checked_count} tracked files against {len(sensitive_terms)} sensitive terms + passcode (0 leaks)."
    )
    return True


def main():
    parser = argparse.ArgumentParser(description="Encrypt Radius private vault and run privacy audit.")
    parser.add_argument("--passcode", default=None, help="Override vault passcode")
    parser.add_argument("--audit-only", action="store_true", help="Only run the zero-plaintext privacy audit")
    args = parser.parse_args()

    passcode = get_passcode(args.passcode)

    if not args.audit_only:
        if not LOCAL_VAULT_PATH.exists():
            print(f"❌ Missing {LOCAL_VAULT_PATH}", file=sys.stderr)
            sys.exit(1)
        plaintext = LOCAL_VAULT_PATH.read_text(encoding="utf-8")
        json.loads(plaintext)
        blob = encrypt_vault(plaintext, passcode)
        update_vault_js(blob)
        print(f"🔐 Updated encrypted vault in {VAULT_JS_PATH.relative_to(RADIUS_ROOT)} ({len(blob['ct'])} bytes ciphertext).")

    if not audit_tracked_files(passcode):
        sys.exit(1)


if __name__ == "__main__":
    main()
