ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS nickname TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE OR REPLACE FUNCTION get_email_by_nickname(p_nickname TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  -- Buscar el ID de usuario mediante el nickname en profiles
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE nickname = p_nickname;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Buscar el email en auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;

  RETURN v_email;
END;
$$;

-- Permitir a usuarios anónimos o autenticados ejecutar esta función
GRANT EXECUTE ON FUNCTION get_email_by_nickname(TEXT) TO anon, authenticated;
