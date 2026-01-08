# Quick Start Guide

## Flytta till Jobbets Server - 3 Steg

### 📤 Steg 1: Pusha till GitHub (Från din privata server)

```bash
cd /DATA/AppData/it-system/DATA/it-ticketing
./push-to-github.sh
```

När scriptet frågar, ange ett commit-meddelande eller tryck Enter för automatiskt.

---

### 📥 Steg 2: Kopiera Deploy-script (Från din maskin/server)

**Alternativ A: Via SCP**
```bash
scp /DATA/AppData/it-system/DATA/it-ticketing/deploy-to-production.sh \
    root@[JOBBETS-SERVER-IP]:/root/
```

**Alternativ B: Ladda ner från GitHub**
```bash
# På jobbets server
wget https://raw.githubusercontent.com/Antonk123/latest-it-ticketing/main/deploy-to-production.sh
chmod +x deploy-to-production.sh
```

---

### 🚀 Steg 3: Deploy (På jobbets server)

```bash
# SSH till jobbets server
ssh root@[JOBBETS-SERVER-IP]

# Kör deployment
./deploy-to-production.sh
```

**Scriptet kommer fråga om:**

1. **Server IP**: Jobbets server IP (t.ex. 192.168.1.100)
2. **Frontend port**: Standard är 8082 (tryck Enter)
3. **Backend port**: Standard är 3002 (tryck Enter)
4. **Supabase credentials**:
   - Project ID: `tuezyqngncnbtlkqvwqm`
   - URL: `https://tuezyqngncnbtlkqvwqm.supabase.co`
   - Key: [din publishable key]

---

### ✅ Steg 4: Verifiera

När scriptet är klart:

1. **Öppna i browser**: `http://[JOBBETS-SERVER-IP]:8082`
2. **Testa registrering**: Skapa ett testkonto
3. **Uppdatera Supabase**:
   - Gå till https://supabase.com/dashboard
   - Authentication → URL Configuration
   - Lägg till: `http://[JOBBETS-SERVER-IP]:8082/**`

---

## 🔧 Vanliga Uppgifter

### Uppdatera applikationen

```bash
cd /opt/it-ticketing
git pull
docker compose up -d --build
```

### Se loggar

```bash
docker logs -f it-ticketing-frontend
docker logs -f it-ticketing-backend
```

### Stoppa applikationen

```bash
cd /opt/it-ticketing
docker compose down
```

### Starta om applikationen

```bash
cd /opt/it-ticketing
docker compose restart
```

---

## 📋 Checklista

- [ ] Pushat alla ändringar till GitHub
- [ ] Kopierat deploy-script till jobbets server
- [ ] Kört deploy-scriptet
- [ ] Testat att frontend är tillgänglig
- [ ] Skapat testkonto
- [ ] Uppdaterat Supabase Redirect URLs
- [ ] Testat login och logout
- [ ] Dokumenterat deployment-info

---

## 🆘 Problem?

**Port redan upptagen?**
```bash
# Ändra port i deploy-scriptet eller manuellt i docker-compose.yml
```

**Containers startar inte?**
```bash
docker logs it-ticketing-frontend
docker logs it-ticketing-backend
```

**Supabase-fel?**
- Verifiera credentials i `.env`
- Kontrollera Redirect URLs i Supabase Dashboard

**Mer hjälp?**
- Se [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) för detaljerad guide
- Se [SETUP_AUTH.md](SETUP_AUTH.md) för auth-problem

---

## 📞 Support

GitHub Issues: https://github.com/Antonk123/latest-it-ticketing/issues
