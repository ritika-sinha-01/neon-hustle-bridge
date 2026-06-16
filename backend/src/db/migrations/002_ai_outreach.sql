CREATE TABLE ai_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  generated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_outreach_student_id ON ai_outreach(student_id);
CREATE INDEX idx_ai_outreach_opportunity_id ON ai_outreach(opportunity_id);
CREATE INDEX idx_ai_outreach_created_at ON ai_outreach(student_id, created_at DESC);
