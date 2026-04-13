# API Stock (StockController)

## Vue d'ensemble

Cette API permet de gérer le stock des produits avec les quantités disponibles, réservées et endommagées.

## Endpoints disponibles

### 1. Récupérer tous les enregistrements de stock
```
GET /api/stock
```

**Réponse :**
```json
[
  {
    "id": 1,
    "productId": 1,
    "productName": "Produit A",
    "currentQuantity": 50,
    "reservedQuantity": 10,
    "damagedQuantity": 2,
    "availableQuantity": 38
  },
  {
    "id": 2,
    "productId": 2,
    "productName": "Produit B",
    "currentQuantity": 25,
    "reservedQuantity": 5,
    "damagedQuantity": 0,
    "availableQuantity": 20
  }
]
```

### 2. Récupérer un stock par ID
```
GET /api/stock/{id}
```

**Réponse :**
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Produit A",
  "currentQuantity": 50,
  "reservedQuantity": 10,
  "damagedQuantity": 2,
  "availableQuantity": 38
}
```

### 3. Récupérer le stock d'un produit spécifique
```
GET /api/stock/product/{productId}
```

**Réponse :**
```json
{
  "id": 1,
  "product": {
    "id": 1,
    "name": "Produit A",
    "sku": "SKU001"
  },
  "currentQuantity": 50,
  "reservedQuantity": 10,
  "damagedQuantity": 2
}
```

### 4. Créer ou mettre à jour un stock
```
POST /api/stock
```

**Corps de la requête :**
```json
{
  "product": {
    "id": 1
  },
  "currentQuantity": 100,
  "reservedQuantity": 0,
  "damagedQuantity": 0
}
```

**Notes :**
- Si un stock existe déjà pour le produit, il est mis à jour
- Si aucun stock n'existe, un nouveau est créé

### 5. Mettre à jour la quantité de stock
```
POST /api/stock/update-quantity/{productId}?quantityChange={quantity}
```

**Exemples :**
- Ajouter 10 unités : `POST /api/stock/update-quantity/1?quantityChange=10`
- Retirer 5 unités : `POST /api/stock/update-quantity/1?quantityChange=-5`

### 6. Ajouter du stock à un produit
```
PUT /api/stock/{productId}/add?quantity={quantity}
```

**Exemple :**
```
PUT /api/stock/1/add?quantity=25
```

### 7. Supprimer un enregistrement de stock
```
DELETE /api/stock/{id}
```

## Exemples d'utilisation

### Consulter le stock d'un produit avec React

```jsx
import React, { useState, useEffect } from 'react';

const StockViewer = ({ productId }) => {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStock();
  }, [productId]);

  const fetchStock = async () => {
    try {
      const response = await fetch(`/api/stock/product/${productId}`);
      
      if (response.ok) {
        const stockData = await response.json();
        setStock(stockData);
      } else if (response.status === 404) {
        setError('Stock non trouvé pour ce produit');
      } else {
        setError('Erreur lors de la récupération du stock');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement du stock...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!stock) return <div>Aucun stock trouvé</div>;

  return (
    <div>
      <h3>Stock du produit: {stock.product.name}</h3>
      <div>
        <p><strong>Quantité actuelle:</strong> {stock.currentQuantity}</p>
        <p><strong>Quantité réservée:</strong> {stock.reservedQuantity}</p>
        <p><strong>Quantité endommagée:</strong> {stock.damagedQuantity}</p>
        <p><strong>Quantité disponible:</strong> {stock.currentQuantity - stock.reservedQuantity - stock.damagedQuantity}</p>
      </div>
    </div>
  );
};

export default StockViewer;
```

### Gérer le stock avec React

```jsx
import React, { useState } from 'react';

const StockManager = ({ productId, onStockUpdate }) => {
  const [quantity, setQuantity] = useState('');
  const [operation, setOperation] = useState('add'); // 'add' ou 'remove'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const quantityValue = parseInt(quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      alert('Veuillez entrer une quantité valide');
      return;
    }

    try {
      let response;
      
      if (operation === 'add') {
        response = await fetch(`/api/stock/${productId}/add?quantity=${quantityValue}`, {
          method: 'PUT'
        });
      } else {
        response = await fetch(`/api/stock/update-quantity/${productId}?quantityChange=-${quantityValue}`, {
          method: 'POST'
        });
      }

      if (response.ok) {
        alert(`Stock ${operation === 'add' ? 'ajouté' : 'retiré'} avec succès`);
        setQuantity('');
        if (onStockUpdate) {
          onStockUpdate();
        }
      } else {
        alert('Erreur lors de la mise à jour du stock');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du stock');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Opération:</label>
        <select value={operation} onChange={(e) => setOperation(e.target.value)}>
          <option value="add">Ajouter du stock</option>
          <option value="remove">Retirer du stock</option>
        </select>
      </div>

      <div>
        <label>Quantité:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          required
        />
      </div>

      <button type="submit">
        {operation === 'add' ? 'Ajouter' : 'Retirer'} le stock
      </button>
    </form>
  );
};

export default StockManager;
```

### Lister tous les stocks

```javascript
const getAllStocks = async () => {
  try {
    const response = await fetch('/api/stock');
    
    if (response.ok) {
      const stocks = await response.json();
      console.log('Stocks:', stocks);
      return stocks;
    } else {
      console.error('Erreur lors de la récupération des stocks');
      return [];
    }
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
};

// Exemple d'utilisation
getAllStocks().then(stocks => {
  stocks.forEach(stock => {
    console.log(`${stock.productName}: ${stock.availableQuantity} disponibles`);
  });
});
```

### Mettre à jour la quantité de stock

```javascript
const updateStockQuantity = async (productId, quantityChange) => {
  try {
    const response = await fetch(`/api/stock/update-quantity/${productId}?quantityChange=${quantityChange}`, {
      method: 'POST'
    });

    if (response.ok) {
      const updatedStock = await response.json();
      console.log('Stock mis à jour:', updatedStock);
      return updatedStock;
    } else {
      console.error('Erreur lors de la mise à jour du stock');
      return null;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

// Exemples d'utilisation
updateStockQuantity(1, 10);  // Ajouter 10 unités
updateStockQuantity(1, -5);  // Retirer 5 unités
```

### Ajouter du stock

```javascript
const addStock = async (productId, quantity) => {
  try {
    const response = await fetch(`/api/stock/${productId}/add?quantity=${quantity}`, {
      method: 'PUT'
    });

    if (response.ok) {
      console.log('Stock ajouté avec succès');
      return true;
    } else {
      console.error('Erreur lors de l\'ajout du stock');
      return false;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
};

// Exemple d'utilisation
addStock(1, 25);
```

### Composant de tableau de bord du stock

```jsx
import React, { useState, useEffect } from 'react';

const StockDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stock');
      
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
      } else {
        setError('Erreur lors de la récupération des stocks');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock) => {
    const available = stock.availableQuantity;
    if (available <= 0) return 'Rupture';
    if (available <= 5) return 'Faible';
    return 'Normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Rupture': return 'red';
      case 'Faible': return 'orange';
      default: return 'green';
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Tableau de bord du stock</h2>
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Quantité actuelle</th>
            <th>Réservé</th>
            <th>Endommagé</th>
            <th>Disponible</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map(stock => {
            const status = getStockStatus(stock);
            return (
              <tr key={stock.id}>
                <td>{stock.productName}</td>
                <td>{stock.currentQuantity}</td>
                <td>{stock.reservedQuantity}</td>
                <td>{stock.damagedQuantity}</td>
                <td>{stock.availableQuantity}</td>
                <td style={{ color: getStatusColor(status) }}>
                  {status}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StockDashboard;
```

## Validation

- `product` : **OBLIGATOIRE** - Produit associé au stock
- `currentQuantity` : **OBLIGATOIRE** - Quantité actuelle (≥ 0)
- `reservedQuantity` : **OBLIGATOIRE** - Quantité réservée (≥ 0)
- `damagedQuantity` : **OBLIGATOIRE** - Quantité endommagée (≥ 0)
- `quantityChange` : Quantité à ajouter/retirer (peut être négative)
- `quantity` : Quantité à ajouter (≥ 0)

## Codes d'erreur

- `400 Bad Request` : Données invalides, stock insuffisant
- `404 Not Found` : Stock ou produit introuvable
- `500 Internal Server Error` : Erreur serveur

## Fonctionnalités

- **Gestion complète du stock** : Création, lecture, mise à jour, suppression
- **Calcul automatique** : Quantité disponible = actuelle - réservée - endommagée
- **Validation des quantités** : Empêche les quantités négatives
- **Gestion des erreurs** : Stock insuffisant, produit introuvable
- **Interface utilisateur** : Composants React pour l'intégration frontend 