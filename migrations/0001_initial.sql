-- Stack Picker — subscribers captured via email-gated actions
--
-- Schema is shared across the jensheitmann.com tools suite. `source` flags
-- which property captured the email (this template defaults to 'stack-picker',
-- but the same table can hold rows from other surfaces). `payload` holds
-- the source-specific JSON snapshot — for stack-picker it's the stack
-- selection; per-source extra columns (voice, email_hmac) stay nullable.
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,           -- 'stack-picker' | (future: any other property in the suite)
  email TEXT NOT NULL,
  action TEXT NOT NULL,           -- 'copy_prompt' | 'copy_stack_image' | 'download_png' | 'download_diagram' | 'reset'
  payload TEXT NOT NULL,          -- JSON snapshot — for stack-picker, the selected items
  voice TEXT,                     -- reserved for cross-suite use; nullable for stack-picker
  mode TEXT,                      -- 'app' | 'content' for stack-picker
  email_hmac TEXT,                -- reserved for cross-suite use; nullable for stack-picker
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscribers_source     ON subscribers(source);
CREATE INDEX IF NOT EXISTS idx_subscribers_email      ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_email_hmac ON subscribers(email_hmac);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);
