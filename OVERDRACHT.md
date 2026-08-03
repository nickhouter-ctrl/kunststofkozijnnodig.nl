# Kunststofkozijnnodig.nl website — overdracht & setup

De marketingwebsite. Los van het CRM: geen database, geen inlog, geen
achtergrondtaken.

| Onderdeel | Waar |
|---|---|
| Applicatie | Vercel — project `kunststofkozijnnodig-nl-ued4` |
| Code | GitHub — `nickhouter-ctrl/kunststofkozijnnodig.nl` |
| Domein | `kunststofkozijnnodig.nl`, externe registrar en externe nameservers |

## Je Mac klaarmaken

```bash
brew install node@24
npm install -g @anthropic-ai/claude-code vercel
vercel login

git clone https://github.com/<jouw-account>/kunststofkozijnnodig.nl.git
cd kunststofkozijnnodig.nl
npm install
vercel link          # kies 'kunststofkozijnnodig-nl-ued4'
vercel env pull      # alleen als er variabelen zijn
npm run dev          # http://localhost:3000
```

## Uitrollen

Elke push naar `main` rolt automatisch uit naar productie.

```bash
git add -A && git commit -m "Wat je veranderd hebt" && git push
```

Controleer vooraf met `npx next build` of het bouwt. Terugrollen kan in
Vercel → *Deployments* → eerdere versie → *Promote to Production*.

## Bij de overdracht

De DNS-records blijven ongewijzigd; alleen de domeinkoppeling in het nieuwe
Vercel-team moet opnieuw bevestigd worden. Zie `OVERDRACHT-DRAAIBOEK.md` in de
CRM-repo's voor de volledige volgorde.
