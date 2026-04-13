# API Mouvements de Stock (StockMovement)

## Vue d'ensemble

Cette API permet de consulter l'historique des mouvements de stock pour chaque produit. Chaque opération sur le stock (entrée, sortie, réservation, retour, endommagement, etc.) est enregistrée et consultable.

## Endpoints disponibles

### 1. Lister tous les mouvements de stock
```
GET /api/stock-movements
```
**Réponse :**
```json
[
  {
    "id": 1,
    "product": {
      "id": 10,
      "name": "Produit A",
      "sku": "SKU001"
    },
    "quantity": 5,
    "type": "AJOUT",
    "reason": "Réception fournisseur",
    "movementDate": "2024-06-25T14:30:00"
  },
  {
    "id": 2,
    "product": {
      "id": 10,
      "name": "Produit A",
      "sku": "SKU001"
    },
    "quantity": -2,
    "type": "RETRAIT",
    "reason": "Vente client",
    "movementDate": "2024-06-25T15:00:00"
  }
]
```

### 2. Lister les mouvements d'un produit donné
```
GET /api/stock-movements/product/{productId}
```
**Réponse :**
```json
[
  {
    "id": 3,
    "product": {
      "id": 10,
      "name": "Produit A",
      "sku": "SKU001"
    },
    "quantity": 10,
    "type": "AJOUT",
    "reason": "Réapprovisionnement",
    "movementDate": "2024-06-25T10:00:00"
  },
  ...
]
```

## Types de mouvements (`type`)
- `AJOUT` : Entrée en stock
- `RETRAIT` : Sortie du stock
- `RESERVATION` : Stock réservé pour une commande
- `LIBERATION_RESERVATION` : Stock réservé libéré (commande annulée ou expédiée)
- `RETOUR_CLIENT` : Retour client conforme
- `ENDOMMAGE` : Produit marqué comme endommagé
- `RETOUR_FOURNISSEUR` : Retour au fournisseur

## Champs de la réponse
- `id` : Identifiant du mouvement
- `product` : Informations du produit concerné (id, nom, sku)
- `quantity` : Quantité du mouvement (positive = entrée, négative = sortie)
- `type` : Type de mouvement (voir ci-dessus)
- `reason` : Raison ou commentaire du mouvement (optionnel)
- `movementDate` : Date et heure du mouvement

## Exemples d'utilisation

### Récupérer l'historique des mouvements d'un produit en React
```js
const getStockMovements = async (productId) => {
  const response = await fetch(`/api/stock-movements/product/${productId}`);
  if (response.ok) {
    const movements = await response.json();
    return movements;
  } else {
    throw new Error('Erreur lors de la récupération de l\'historique de stock');
  }
};

// Exemple d'affichage
getStockMovements(10).then(movements => {
  movements.forEach(mvt => {
    console.log(`${mvt.movementDate} : ${mvt.type} (${mvt.quantity}) - ${mvt.reason}`);
  });
});
```

## Validation
- `product` : **OBLIGATOIRE**
- `quantity` : **OBLIGATOIRE** (peut être négatif pour une sortie)
- `type` : **OBLIGATOIRE**
- `movementDate` : **OBLIGATOIRE**
- `reason` : Optionnel

## Codes d'erreur
- `404 Not Found` : Produit ou mouvement introuvable
- `400 Bad Request` : Données invalides
- `500 Internal Server Error` : Erreur serveur

## Fonctionnalités automatiques
- Chaque modification de stock (ajout, retrait, réservation, retour, etc.) crée automatiquement un mouvement dans l'historique
- L'historique est consultable par produit ou globalement 