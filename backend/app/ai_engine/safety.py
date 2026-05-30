class SafetyFilter:
    BLOCKED_PATTERNS = [
        "ignore previous instructions",
        "ignore all instructions",
        "you are now",
        "act as",
        "jailbreak",
        "forget your instructions",
    ]
    
    def check_input(self, text: str) -> tuple[bool, str]:
        """Returns (is_safe, reason)"""
        text_lower = text.lower()
        for pattern in self.BLOCKED_PATTERNS:
            if pattern in text_lower:
                return False, "Prompt injection detected"
        if len(text) > 2000:
            return False, "Query too long"
        return True, ""
    
    def check_output(self, text: str) -> str:
        """Post-process AI output for safety"""
        # If response contains no context from docs, add disclaimer
        return text
