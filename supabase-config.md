# Configuration Supabase

## 1. Installer Supabase
```bash
npm install @supabase/supabase-js
```

## 2. Créer un projet Supabase
1. Aller sur https://supabase.com/
2. Créer un nouveau projet
3. Noter l'URL et la clé API

## 3. Configuration Supabase
Créer `src/config/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 4. Variables d'environnement
Créer `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Tables SQL nécessaires
```sql
-- Table des utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('teacher', 'student')),
  instrument TEXT,
  picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des groupes
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison groupes-élèves
CREATE TABLE group_students (
  group_id UUID REFERENCES groups(id),
  student_id UUID REFERENCES users(id),
  PRIMARY KEY (group_id, student_id)
);
``` 