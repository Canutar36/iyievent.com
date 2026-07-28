-- Avatarlar bucket'ı oluştur (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatarlar', 'avatarlar', true)
ON CONFLICT (id) DO NOTHING;

-- Avatarlar için RLS politikası: herkes okuyabilsin, sadece sahibi yazabilsin
CREATE POLICY "Avatarlar herkese açık okuma"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatarlar');

CREATE POLICY "Kullanıcılar kendi avatarlarını yükleyebilir"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatarlar' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Kullanıcılar kendi avatarlarını güncelleyebilir"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatarlar' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Kullanıcılar kendi avatarlarını silebilir"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatarlar' AND auth.uid()::text = (storage.foldername(name))[1]);
