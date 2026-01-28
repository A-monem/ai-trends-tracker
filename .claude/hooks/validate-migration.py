#!/usr/bin/env python3

"""
Migration validator hook: Check database migrations for safety issues
Exit codes: 0 = success, 1 = warning, 2 = block command
"""

import json
import sys
import re

def main():
    try:
        # Read tool input from stdin
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    # Extract command from tool input
    tool_input = input_data.get("tool_input", {})
    command = tool_input.get("command", "")

    if not command:
        # No command to validate
        sys.exit(0)

    print("🔍 Validating database migration command...")

    # List of dangerous SQL patterns to check for
    dangerous_patterns = [
        (
            r"DROP\s+TABLE(?!\s+IF\s+EXISTS)",
            "⚠️  DROP TABLE without IF EXISTS - this will fail if table doesn't exist",
            1  # Warning level
        ),
        (
            r"ALTER\s+TABLE.*DROP\s+COLUMN(?!\s+IF\s+EXISTS)",
            "❌ DROP COLUMN without IF EXISTS - not backward compatible!",
            2  # Block level
        ),
        (
            r"DELETE\s+FROM.*WHERE",
            "⚠️  DELETE statement detected - ensure you have a backup and WHERE clause is correct",
            1  # Warning level
        ),
        (
            r"TRUNCATE\s+TABLE",
            "❌ TRUNCATE TABLE - this deletes all data! Use with extreme caution.",
            2  # Block level
        ),
        (
            r"ALTER\s+TABLE.*ALTER\s+COLUMN.*NOT\s+NULL",
            "⚠️  Adding NOT NULL constraint - ensure column has values for all rows",
            1  # Warning level
        ),
        (
            r"ALTER\s+TABLE.*RENAME\s+COLUMN",
            "❌ RENAME COLUMN - not backward compatible! Use multi-step migration.",
            2  # Block level
        ),
    ]

    # Check for dangerous patterns
    issues_found = []
    max_severity = 0

    for pattern, message, severity in dangerous_patterns:
        if re.search(pattern, command, re.IGNORECASE):
            issues_found.append((message, severity))
            max_severity = max(max_severity, severity)

    # Check for transaction usage
    if not re.search(r"BEGIN|START\s+TRANSACTION", command, re.IGNORECASE):
        issues_found.append((
            "⚠️  Migration should be wrapped in a transaction (BEGIN...COMMIT)",
            1
        ))
        max_severity = max(max_severity, 1)

    # Check for both UP and DOWN migrations (if it's a migration create command)
    if "migration:create" in command or "db:generate" in command:
        issues_found.append((
            "💡 Remember to write both UP and DOWN migrations",
            0
        ))

    # Print all issues found
    if issues_found:
        print("\n" + "="*60)
        print("Migration Validation Results:")
        print("="*60)
        for message, severity in issues_found:
            print(message)
        print("="*60 + "\n")

        if max_severity >= 2:
            print("❌ Migration validation FAILED - command blocked")
            print("\nFix the issues above or use a safer migration approach.")
            print("See CLAUDE.md for migration best practices.")
            sys.exit(2)  # Block the command
        elif max_severity == 1:
            print("⚠️  Migration has warnings - proceed with caution")
            sys.exit(1)  # Warning
        else:
            print("💡 Migration tips provided")
            sys.exit(0)
    else:
        print("✅ Migration validation passed")
        sys.exit(0)


if __name__ == "__main__":
    main()
