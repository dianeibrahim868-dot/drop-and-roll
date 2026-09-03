# Setup Drop & Roll — Instructions

## 1. Installer les dépendances
```bash
npm install
```

## 2. Configurer les variables d'environnement
```bash
cp .env.example .env.local
# Puis éditer .env.local avec tes vraies valeurs Supabase/Resend
```

## 3. Tester en local
```bash
npm run dev
```

## 4. Pousser sur GitHub
```bash
git init
git add .
git commit -m "Initial commit Drop & Roll"
git remote add origin https://github.com/dianeibrahim868-dot/drop-and-roll.git
git push -u origin main
```

## 5. Sur Netlify
- Cliquer "Create repository" → crée le repo GitHub automatiquement
- OU lier le repo GitHub existant après le premier deploy manuel
- Ajouter les variables d'environnement dans Project configuration > Environment variables
