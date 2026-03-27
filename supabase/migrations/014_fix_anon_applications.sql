-- Allow anonymous users to submit applications (no auth required for applying)
CREATE POLICY "Anyone can submit an application"
  ON applications FOR INSERT WITH CHECK (true);

-- Allow admins to manage applications
CREATE POLICY "Admins manage applications"
  ON applications FOR ALL USING (is_admin());
