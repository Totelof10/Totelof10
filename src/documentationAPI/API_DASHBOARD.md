# API Dashboard

Cette API fournit les indicateurs clés pour le tableau de bord de gestion (chiffre d'affaires, produits vendus, filtrage par date, etc.).

## Endpoints disponibles

### 1. Chiffre d'affaires total
```
GET /api/dashboard/total-revenue
```
**Réponse :**
```json
15400.50
```

### 2. Nombre total de produits vendus
```
GET /api/dashboard/total-products-sold
```
**Réponse :**
```json
350
```

### 3. Chiffre d'affaires et produits vendus entre deux dates
```
GET /api/dashboard/revenue-between?startDate=2024-01-01&endDate=2024-06-30
```
- **Paramètres** :
  - `startDate` (format `yyyy-MM-dd`) : date de début incluse
  - `endDate` (format `yyyy-MM-dd`) : date de fin incluse

**Réponse :**
```json
{
  "revenue": 8000.00,
  "productsSold": 120
}
```

### 4. Chiffre d'affaires **et produits vendus** par mois pour une année donnée
```
GET /api/dashboard/monthly-revenue?year=2024
```
- **Paramètre** :
  - `year` (ex : 2024)

**Réponse :**
```json
{
  "2024-01": { "revenue": 2500.0, "productsSold": 40 },
  "2024-02": { "revenue": 3200.0, "productsSold": 55 },
  "2024-03": { "revenue": 2800.0, "productsSold": 38 },
  "2024-04": { "revenue": 3100.0, "productsSold": 50 },
  "2024-05": { "revenue": 2800.0, "productsSold": 45 },
  "2024-06": { "revenue": 3000.0, "productsSold": 52 }
}
```

## Exemples d'utilisation (JavaScript/React)

### Récupérer le chiffre d'affaires total
```js
fetch('/api/dashboard/total-revenue')
  .then(res => res.json())
  .then(data => console.log('CA total:', data));
```

### Récupérer le nombre de produits vendus
```js
fetch('/api/dashboard/total-products-sold')
  .then(res => res.json())
  .then(data => console.log('Produits vendus:', data));
```

### Récupérer le CA et produits vendus entre deux dates
```js
fetch('/api/dashboard/revenue-between?startDate=2024-01-01&endDate=2024-06-30')
  .then(res => res.json())
  .then(data => console.log('CA:', data.revenue, 'Produits:', data.productsSold));
```

### Récupérer le CA et produits vendus par mois pour une année
```js
fetch('/api/dashboard/monthly-revenue?year=2024')
  .then(res => res.json())
  .then(data => console.log('CA/Produits par mois:', data));
```

## Validation & Sécurité
- Tous les endpoints sont en lecture seule.
- Les données sont calculées uniquement sur les commandes avec le statut `PAID`.
- Les paramètres de date doivent être au format `yyyy-MM-dd`.

## Codes d'erreur
- `400 Bad Request` : Paramètres invalides
- `500 Internal Server Error` : Erreur serveur 