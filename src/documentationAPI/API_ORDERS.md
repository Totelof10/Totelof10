# API Commandes (OrderController)

## Vue d'ensemble

Cette API permet de gérer les commandes (création, consultation, mise à jour, suppression) avec gestion de la date d'échéance (`dueDate`).

## Endpoints disponibles

### 1. Récupérer toutes les commandes
```
GET /api/orders
```

**Réponse :**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-123456",
    "orderDate": "2024-01-15T10:30:00",
    "status": "PENDING",
    "totalAmount": 150.00,
    "discountAmount": 10.00,
    "customer": {
      "id": 1,
      "name": "Jean Dupont",
      "email": "jean.dupont@email.com"
    },
    "orderItems": [
      {
        "id": 1,
        "quantity": 2,
        "unitPrice": 25.00,
        "subtotal": 50.00,
        "productId": 1,
        "productName": "Produit A"
      }
    ],
    "echeanceDate": "2024-01-20T10:30:00"
  }
]
```

### 2. Récupérer une commande par ID
```
GET /api/orders/{id}
```

### 3. Créer une nouvelle commande
```
POST /api/orders
```

**Corps de la requête :**
```json
{
  "orderDate": "2024-07-01T10:00:00",
  "dueDate": "2024-07-15T23:59:59",
  "customer": {
    "id": 1
  },
  "orderItems": [
    {
      "product": {
        "id": 1
      },
      "quantity": 2
    },
    {
      "product": {
        "id": 2
      },
      "quantity": 1
    }
  ],
  "discountAmount": 10.00
}
```

**Notes :**
- Le `orderNumber` est généré automatiquement
- La `orderDate` est définie automatiquement
- Le `totalAmount` est calculé automatiquement
- Le stock est automatiquement réservé
- Le champ `dueDate` doit être fourni par le frontend lors de la création de la commande.
- Si `dueDate` est absent ou null, la création échouera avec une erreur 400.

### 4. Mettre à jour le statut d'une commande
```
PUT /api/orders/{id}/status?newStatus={status}
```

**Statuts disponibles :**
- `PENDING` - En attente
- `PROCESSING` - En cours de traitement
- `SHIPPED` - Expédié
- `DELIVERED` - Livré
- `CANCELLED` - Annulé
- `RETURNED` - Retourné
- `COMPLETED_RETURN` - Retour complété
- `PARTIALLY_PAID` - Partiellement payé
- `PAID` - Payé

**Exemple :**
```
PUT /api/orders/1/status?newStatus=SHIPPED
```

### 5. Obtenir le montant net payé d'une commande
```
GET /api/orders/{orderId}/net-paid-amount
```

**Réponse :**
```json
125.50
```

### 6. Traiter les retours d'une commande
```
POST /api/orders/{id}/process-returns
```

**Corps de la requête :**
```json
[
  {
    "orderItemId": 1,
    "returnedQuantity": 1,
    "reason": "Produit défectueux"
  },
  {
    "orderItemId": 2,
    "returnedQuantity": 2,
    "reason": "Mauvaise taille"
  }
]
```

### 7. Enregistrer un paiement en espèces
```
POST /api/orders/{orderId}/pay-cash
```

**Corps de la requête :**
```json
{
  "amount": 50.00
}
```

**Réponse :**
```json
{
  "id": 1,
  "amount": 50.00,
  "paymentMethod": "CASH",
  "paymentStatus": "COMPLETED",
  "paymentDate": "2024-01-15T14:30:00",
  "orderId": 1
}
```

### 8. Supprimer une commande
```
DELETE /api/orders/{id}
```

**Notes :**
- Le stock est automatiquement réintégré
- Tous les paiements associés sont supprimés

## 9. Filtrage par date

```
GET /api/orders/by-date?start=2024-05-01T00:00:00&end=2024-05-31T23:59:59&page=0&size=20
```
## 10. Recherche par le nom
```
GET /api/products/search?name=riz&page=0&size=10
```

## Exemples d'utilisation

### Créer une commande avec React

```jsx
import React, { useState } from 'react';

const OrderForm = () => {
  const [orderData, setOrderData] = useState({
    customerId: '',
    orderItems: [],
    discountAmount: 0
  });

  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: 1
  });

  const addOrderItem = () => {
    if (currentItem.productId && currentItem.quantity > 0) {
      setOrderData(prev => ({
        ...prev,
        orderItems: [...prev.orderItems, { ...currentItem }]
      }));
      setCurrentItem({ productId: '', quantity: 1 });
    }
  };

  const removeOrderItem = (index) => {
    setOrderData(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const orderPayload = {
      orderDate: "2024-07-01T10:00:00",
      dueDate: "2024-07-15T23:59:59",
      customer: { id: parseInt(orderData.customerId) },
      orderItems: orderData.orderItems.map(item => ({
        product: { id: parseInt(item.productId) },
        quantity: parseInt(item.quantity)
      })),
      discountAmount: parseFloat(orderData.discountAmount)
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const createdOrder = await response.json();
        alert('Commande créée avec succès !');
        console.log('Commande créée:', createdOrder);
      } else {
        alert('Erreur lors de la création de la commande');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la commande');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>ID du client:</label>
        <input
          type="number"
          value={orderData.customerId}
          onChange={(e) => setOrderData({...orderData, customerId: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Montant de réduction:</label>
        <input
          type="number"
          step="0.01"
          value={orderData.discountAmount}
          onChange={(e) => setOrderData({...orderData, discountAmount: e.target.value})}
        />
      </div>

      <div>
        <h3>Articles de la commande</h3>
        {orderData.orderItems.map((item, index) => (
          <div key={index}>
            <span>Produit ID: {item.productId}, Quantité: {item.quantity}</span>
            <button type="button" onClick={() => removeOrderItem(index)}>
              Supprimer
            </button>
          </div>
        ))}

        <div>
          <input
            type="number"
            placeholder="ID du produit"
            value={currentItem.productId}
            onChange={(e) => setCurrentItem({...currentItem, productId: e.target.value})}
          />
          <input
            type="number"
            placeholder="Quantité"
            value={currentItem.quantity}
            onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
          />
          <button type="button" onClick={addOrderItem}>
            Ajouter l'article
          </button>
        </div>
      </div>

      <button type="submit">Créer la commande</button>
    </form>
  );
};

export default OrderForm;
```

### Mettre à jour le statut d'une commande

```javascript
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/status?newStatus=${newStatus}`, {
      method: 'PUT'
    });

    if (response.ok) {
      const updatedOrder = await response.json();
      console.log('Statut mis à jour:', updatedOrder);
    } else {
      console.error('Erreur lors de la mise à jour du statut');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Exemple d'utilisation
updateOrderStatus(1, 'SHIPPED');
```

### Enregistrer un paiement

```javascript
const registerPayment = async (orderId, amount) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/pay-cash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: amount })
    });

    if (response.ok) {
      const payment = await response.json();
      console.log('Paiement enregistré:', payment);
    } else {
      console.error('Erreur lors de l\'enregistrement du paiement');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Exemple d'utilisation
registerPayment(1, 50.00);
```

## Validation

- `customer` : **OBLIGATOIRE** - Client associé à la commande
- `orderItems` : **OBLIGATOIRE** - Liste des articles de la commande
- `product` : **OBLIGATOIRE** - Produit dans chaque article
- `quantity` : **OBLIGATOIRE** - Quantité positive
- `discountAmount` : Optionnel - Montant de réduction (≥ 0)
- `dueDate` : **OBLIGATOIRE** lors de la création d'une commande. Doit être une date valide au format ISO (ex : `2024-07-15T23:59:59`).
- Si `dueDate` est manquant ou invalide, l'API retourne une erreur 400.

## Codes d'erreur

- `400 Bad Request` : Données invalides, stock insuffisant, champ `dueDate` manquant
- `404 Not Found` : Commande introuvable
- `500 Internal Server Error` : Erreur serveur

## Fonctionnalités automatiques

- **Génération du numéro de commande** : UUID automatique
- **Date de commande** : Date/heure actuelle
- **Calcul du montant total** : Somme des sous-totaux moins réduction
- **Réservation du stock** : Décrémentation automatique
- **Réintégration du stock** : Lors de la suppression 