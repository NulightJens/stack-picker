-- Stack Picker — subscribers captured via email-gated actions
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  action TEXT NOT NULL,           -- 'copy_prompt' | 'copy_stack_image' | 'download_png' | 'download_diagram' | 'reset'
  mode TEXT NOT NULL,             -- 'app' | 'content'
  stack_json TEXT NOT NULL,       -- JSON snapshot of selected items
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);
