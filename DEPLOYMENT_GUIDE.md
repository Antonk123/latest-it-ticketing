# IT-Ticketing Production Deployment Guide

## Snabbstart

### Steg 1: Förbered på din privata server (gör detta FÖRST)

```bash
cd /DATA/AppData/it-system/DATA/it-ticketing

# Pusha alla ändringar till GitHub
./push-to-github.sh
```

### Steg 2: Kopiera deploy-scriptet till jobbets server

```bash
# På din lokala maskin eller från din privata server
scp deploy-to-production.sh root@[JOBBETS-SERVER-IP]:/root/
```

### Steg 3: Kör deployment på jobbets server

```bash
# SSH till jobbets server
ssh root@[JOBBETS-SERVER-IP]

# Kör deployment-scriptet
./deploy-to-production.sh
```

Scriptet kommer fråga dig om:
- Server IP-adress
- Portar (standard: 8082 för frontend, 3002 för backend)
- Supabase credentials

### Steg 4: Uppdatera Supabase

1. Gå till https://supabase.com/dashboard
2. Välj ditt projekt
3. Gå till **Authentication → URL Configuration**
4. Lägg till i **Redirect URLs**:
   ```
   http://[JOBBETS-SERVER-IP]:8082/**
   ```

## Detaljerad Guide

### Förutsättningar

På jobbets server måste följande vara installerat:
- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Git

#### Installera Docker (om det inte finns)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Starta Docker
systemctl start docker
systemctl enable docker
```

### Manuell Deployment (utan script)

Om du föredrar att göra det manuellt:

#### 1. Klona repository

```bash
cd /opt
git clone https://github.com/Antonk123/latest-it-ticketing.git it-ticketing
cd it-ticketing
```

#### 2. Skapa .env fil

```bash
cat > .env << 'EOF'
VITE_SUPABASE_PROJECT_ID=tuezyqngncnbtlkqvwqm
VITE_SUPABASE_PUBLISHABLE_KEY=[din-nyckel]
VITE_SUPABASE_URL=https://tuezyqngncnbtlkqvwqm.supabase.co
EOF
```

#### 3. Uppdatera docker-compose.yml

```bash
# Ersätt IP-adress (exempel: från 10.10.10.18 till 192.168.1.100)
sed -i 's/10.10.10.18/192.168.1.100/g' docker-compose.yml

# Eller redigera manuellt
nano docker-compose.yml
# Uppdatera rad 24: VITE_API_URL med jobbets server IP
```

#### 4. Starta containers

```bash
docker compose up -d --build
```

#### 5. Verifiera deployment

```bash
# Kontrollera att containers körs
docker ps

# Testa backend
curl http://localhost:3002/api/health

# Testa frontend
curl http://localhost:8082
```

### Portainer Integration

#### Alternativ A: Stack från Git Repository

1. Logga in på Portainer
2. Gå till **Stacks → Add Stack**
3. Välj **Git Repository**
4. Fyll i:
   - **Name**: it-ticketing
   - **Repository URL**: https://github.com/Antonk123/latest-it-ticketing
   - **Reference**: main
   - **Compose path**: docker-compose.yml
5. Under **Environment variables**, lägg till:
   ```
   VITE_SUPABASE_PROJECT_ID=tuezyqngncnbtlkqvwqm
   VITE_SUPABASE_PUBLISHABLE_KEY=[din-nyckel]
   VITE_SUPABASE_URL=https://tuezyqngncnbtlkqvwqm.supabase.co
   ```
6. Klicka **Deploy the stack**

#### Alternativ B: Stack från Deployed Container

Om du redan har kört scriptet:

1. Gå till **Containers**
2. Hitta `it-ticketing-frontend` och `it-ticketing-backend`
3. Klicka på **Add to Stack** för båda
4. Namnge stacken: `it-ticketing`

### Uppdatera Applikationen

#### Via Git Pull

```bash
cd /opt/it-ticketing
git pull
docker compose up -d --build
```

#### Via Portainer (om du använder Stack från Git)

1. Gå till **Stacks → it-ticketing**
2. Klicka **Pull and redeploy**

### Backup och Restore

#### Backup av data

```bash
# Backup docker volumes
docker run --rm \
  -v it-ticketing_ticket-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/ticket-data-$(date +%Y%m%d).tar.gz -C /data .
```

#### Restore data

```bash
# Restore från backup
docker run --rm \
  -v it-ticketing_ticket-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/ticket-data-YYYYMMDD.tar.gz -C /data
```

### Troubleshooting

#### Containers startar inte

```bash
# Kontrollera logs
docker logs it-ticketing-frontend
docker logs it-ticketing-backend

# Kontrollera om portar är upptagna
netstat -tuln | grep -E '8082|3002'
```

#### Kan inte ansluta till Supabase

1. Verifiera att `.env` filen har rätt credentials
2. Kontrollera att server har internetanslutning:
   ```bash
   curl https://tuezyqngncnbtlkqvwqm.supabase.co
   ```

#### Frontend kan inte nå backend

1. Verifiera att VITE_API_URL i docker-compose.yml pekar på rätt IP
2. Kontrollera att backend körs:
   ```bash
   curl http://localhost:3002/api/health
   ```

#### Sign-up fungerar inte

1. Kontrollera att sign-up är aktiverat i Supabase Dashboard
2. Verifiera att Redirect URLs är korrekt konfigurerade
3. Kontrollera browser console för felmeddelanden

### Säkerhet

#### Brandväggsregler

```bash
# UFW
ufw allow 8082/tcp
ufw allow 3002/tcp

# firewalld
firewall-cmd --permanent --add-port=8082/tcp
firewall-cmd --permanent --add-port=3002/tcp
firewall-cmd --reload
```

#### SSL/TLS (för produktion)

För att använda HTTPS behöver du:
1. Ett domännamn
2. Nginx eller Traefik som reverse proxy
3. Let's Encrypt certifikat

Exempel med Nginx:

```nginx
server {
    listen 443 ssl;
    server_name it-ticketing.dittforetag.se;

    ssl_certificate /etc/letsencrypt/live/it-ticketing.dittforetag.se/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/it-ticketing.dittforetag.se/privkey.pem;

    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Monitoring

#### Kontrollera container-hälsa

```bash
# Snabb överblick
docker ps

# Detaljerad info
docker stats

# Logs i realtid
docker logs -f it-ticketing-frontend
docker logs -f it-ticketing-backend
```

#### Disk-användning

```bash
# Kontrollera volume-storlek
docker system df -v

# Rensa oanvända images
docker system prune -a
```

### Rollback

Om något går fel:

```bash
# Stoppa nuvarande containers
docker compose down

# Återställ från backup
cd /opt/it-ticketing-backup-YYYYMMDD-HHMMSS

# Starta gamla versionen
docker compose up -d
```

### Kontaktinformation

För support eller frågor:
- GitHub: https://github.com/Antonk123/latest-it-ticketing
- Issues: https://github.com/Antonk123/latest-it-ticketing/issues

### Versionshantering

Det här projektet använder:
- **Node.js**: 20 Alpine
- **Nginx**: Alpine
- **Vite**: 5.4.19
- **React**: 18.3.1
- **Supabase**: Latest

### Viktiga filer

- `docker-compose.yml` - Container-konfiguration
- `Dockerfile.client` - Frontend build
- `Dockerfile.server` - Backend build
- `.env` - Miljövariabler
- `deploy-to-production.sh` - Automated deployment script
- `push-to-github.sh` - Quick git push script
