"""Export a Claude Code session (.jsonl) to AI_CONVERSATION_TRANSCRIPT.md.

Usage: python tools/export-transcript.py <session.jsonl> [out.md]

Every user prompt and AI response is included verbatim, in order, with timestamps.
Tool calls the AI made (reading files, running commands, writing code) and their
results are included as labelled blocks. Long tool inputs/results are truncated
with a note; the full files live in this repository. Harness-injected
<system-reminder> blocks (project instructions loaded automatically) are removed
because they are not part of the conversation.
"""
import json, re, sys
from datetime import datetime, timezone

MAX_TOOL_INPUT = 4000
MAX_TOOL_RESULT = 1200

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "AI_CONVERSATION_TRANSCRIPT.md"

def ts(s):
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone().strftime("%Y-%m-%d %H:%M")
    except Exception:
        return s or ""

def clean_user(text):
    text = re.sub(r"<system-reminder>.*?</system-reminder>", "", text, flags=re.S)
    text = re.sub(r"<command-name>.*?</command-name>\s*<command-message>.*?</command-message>\s*<command-args>.*?</command-args>", "", text, flags=re.S)
    text = re.sub(r"<local-command-stdout>.*?</local-command-stdout>", "", text, flags=re.S)
    text = re.sub(r"</?pasted_content[^>]*>", "", text)
    return text.strip()

def trunc(s, n):
    s = s if isinstance(s, str) else json.dumps(s, indent=2, ensure_ascii=False)
    if len(s) <= n:
        return s
    return s[:n] + f"\n... [truncated, {len(s) - n} more characters]"

def fence(s):
    return "```\n" + s.replace("```", "'''") + "\n```"

lines = []
count_user = count_ai = 0
with open(src, encoding="utf-8") as f:
    for raw in f:
        try:
            rec = json.loads(raw)
        except json.JSONDecodeError:
            continue
        msg = rec.get("message")
        if not msg or rec.get("type") not in ("user", "assistant"):
            continue
        role = msg.get("role")
        content = msg.get("content")
        when = ts(rec.get("timestamp", ""))
        if isinstance(content, str):
            content = [{"type": "text", "text": content}]
        for block in content or []:
            t = block.get("type")
            if role == "user" and t == "text":
                text = clean_user(block.get("text", ""))
                if not text:
                    continue
                count_user += 1
                lines.append(f"### User · {when}\n\n{text}\n")
            elif role == "user" and t == "tool_result":
                c = block.get("content")
                if isinstance(c, list):
                    c = "\n".join(x.get("text", "[image]") if isinstance(x, dict) else str(x) for x in c)
                lines.append(f"**Tool result** · {when}\n\n{fence(trunc(c or '', MAX_TOOL_RESULT))}\n")
            elif role == "assistant" and t == "text":
                text = block.get("text", "").strip()
                if not text:
                    continue
                count_ai += 1
                lines.append(f"### AI · {when}\n\n{text}\n")
            elif role == "assistant" and t == "tool_use":
                name = block.get("name", "tool")
                inp = block.get("input", {})
                if name in ("Write",) and isinstance(inp, dict):
                    body = f"file_path: {inp.get('file_path')}\n\n{inp.get('content', '')}"
                elif name in ("Edit",) and isinstance(inp, dict):
                    body = f"file_path: {inp.get('file_path')}\n\n--- old ---\n{inp.get('old_string')}\n--- new ---\n{inp.get('new_string')}"
                elif name == "Bash" and isinstance(inp, dict):
                    body = f"# {inp.get('description', '')}\n{inp.get('command', '')}"
                else:
                    body = json.dumps(inp, indent=2, ensure_ascii=False)
                lines.append(f"**AI → tool `{name}`** · {when}\n\n{fence(trunc(body, MAX_TOOL_INPUT))}\n")

header = f"""# AI conversation transcript: Let's Roam hunt screen redesign

Tool: Claude Code (Anthropic), model Claude Fable 5.1, in the terminal with the Chrome extension for screenshots.
Session file: `{src.split('/')[-1].split(chr(92))[-1]}`. Exported {datetime.now().strftime('%Y-%m-%d %H:%M')} by `tools/export-transcript.py`.

One session, in chronological order. {count_user} user messages, {count_ai} AI messages, plus the tool calls the AI made
(file reads, shell commands, code writes, browser screenshots) and their results. Nothing is summarised or rewritten;
long tool inputs and results are truncated with a note and the full files are in this repository. The AI's private
reasoning blocks are not part of the exported record. Timestamps are local time (Eastern).

---

"""
with open(out, "w", encoding="utf-8") as f:
    f.write(header + "\n".join(lines))
print(f"wrote {out}: {count_user} user, {count_ai} ai, {len(lines)} blocks")
