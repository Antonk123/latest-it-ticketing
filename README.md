# IT-Ticketing System

Ett modernt IT-ärendehanteringssystem byggt med React, TypeScript och Supabase.

## 🚀 Snabbstart

### Lokal utveckling

```bash
# Installera dependencies
npm install

# Starta utvecklingsserver
npm run dev
```

### Docker Deployment

```bash
# Snabb deploy
docker compose up -d --build
```

### Production Deployment

```bash
# Använd automated deployment script
./deploy-to-production.sh
```

För detaljerad deployment-guide, se [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📋 Features

- ✅ Användarautentisering med Supabase
- ✅ Skapa och hantera IT-ärenden
- ✅ Kategorisering av ärenden
- ✅ Kontakthantering
- ✅ Checklists för ärenden
- ✅ Filbilagor
- ✅ Responsiv design
- ✅ Dark mode support

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Docker, Nginx

## 📦 Projektstruktur

```
it-ticketing/
├── src/
│   ├── components/     # React komponenter
│   ├── pages/         # Sidor
│   ├── contexts/      # React contexts (Auth, etc)
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities
│   └── integrations/  # Supabase integration
├── supabase/
│   ├── migrations/    # Database migrations
│   └── functions/     # Edge functions
├── public/            # Statiska filer
├── Dockerfile.client  # Frontend Docker build
├── Dockerfile.server  # Backend Docker build
└── docker-compose.yml # Container orchestration
```

## 🔧 Konfiguration

### Miljövariabler

Skapa en `.env` fil i root:

```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### Docker Portar

- Frontend: `8082` → `80` (nginx)
- Backend: `3002` → `3001` (node)

## 📚 Scripts

| Script | Beskrivning |
|--------|-------------|
| `npm run dev` | Starta utvecklingsserver |
| `npm run build` | Bygga för produktion |
| `npm run preview` | Förhandsgranska production build |
| `./push-to-github.sh` | Pusha ändringar till GitHub |
| `./deploy-to-production.sh` | Deploy till production server |

## 🐳 Docker

### Bygga och starta

```bash
docker compose up -d --build
```

### Stoppa

```bash
docker compose down
```

### Visa logs

```bash
docker logs -f it-ticketing-frontend
docker logs -f it-ticketing-backend
```

## 📖 Dokumentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detaljerad deployment-guide
- [SETUP_AUTH.md](SETUP_AUTH.md) - Autentiseringskonfiguration

## 🔐 Säkerhet

- Användarautentisering via Supabase Auth
- Row Level Security (RLS) i databas
- CORS konfiguration
- Environment variables för känslig data

## 🚦 Supabase Setup

1. Skapa ett Supabase-projekt på https://supabase.com
2. Kör migrationer i `supabase/migrations/`
3. Konfigurera Authentication providers
4. Lägg till Redirect URLs i dashboard

Detaljerade instruktioner finns i [SETUP_AUTH.md](SETUP_AUTH.md)

## 🤝 Bidra

1. Forka projektet
2. Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Push till branchen (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

## 📝 Licens

Detta projekt är proprietary software.

## 👥 Support

För frågor eller support, öppna ett issue på GitHub.

## 🔄 Updates

### Uppdatera från Git

```bash
git pull
docker compose up -d --build
```

### Uppdatera via Portainer

1. Gå till Stacks → it-ticketing
2. Klicka "Pull and redeploy"

## 📊 Status

- ✅ Authentication
- ✅ Ticket Management
- ✅ Contact Management
- ✅ File Attachments
- ✅ Docker Support
- ✅ Production Ready

## 🎯 Roadmap

- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Ticket templates
- [ ] Mobile app
- [ ] API documentation

---

**Built with** ❤️ **by your team**
