# API Produits (ProductController)

## Vue d'ensemble

Cette API permet de gérer les produits avec leurs informations de base, prix, seuils de stock minimum, unité de mesure, catégorie et statut.

## Endpoints disponibles

### 1. Récupérer tous les produits
```
GET /api/products
```

**Réponse :**
```json
[
  {
    "id": 1,
    "name": "Produit A",
    "description": "Description du produit A",
    "sku": "SKU001",
    "price": 25.00,
    "purchasePrice": 15.00,
    "minStockQuantity": 10,
    "unite": "kg",
    "category": "Alimentaire",
    "productStatus": "ACTIF",
    "supplier": {
      "id": 1,
      "name": "Fournisseur A",
      "email": "fournisseur@email.com"
    }
  },
  {
    "id": 2,
    "name": "Produit B",
    "description": "Description du produit B",
    "sku": "SKU002",
    "price": 35.00,
    "purchasePrice": 20.00,
    "minStockQuantity": 5,
    "unite": "pièce",
    "category": "Électronique",
    "productStatus": "ACTIF",
    "supplier": {
      "id": 2,
      "name": "Fournisseur B",
      "email": "fournisseur2@email.com"
    }
  }
]
```

### 2. Récupérer un produit par ID
```
GET /api/products/{id}
```

**Réponse :**
```json
{
  "id": 1,
  "name": "Produit A",
  "description": "Description du produit A",
  "sku": "SKU001",
  "price": 25.00,
  "purchasePrice": 15.00,
  "minStockQuantity": 10,
  "unite": "kg",
  "category": "Alimentaire",
  "productStatus": "ACTIF",
  "supplier": {
    "id": 1,
    "name": "Fournisseur A",
    "email": "fournisseur@email.com"
  }
}
```

### 3. Créer un nouveau produit
```
POST /api/products
```

**Corps de la requête :**
```json
{
  "name": "Nouveau Produit",
  "description": "Description du nouveau produit",
  "sku": "SKU003",
  "price": 30.00,
  "purchasePrice": 18.00,
  "minStockQuantity": 8,
  "unite": "litre",
  "category": "Boissons",
  "productStatus": "ACTIF",
  "supplier": {
    "id": 1
  }
}
```

**Notes :**
- Un enregistrement de stock est automatiquement créé avec une quantité de 0
- Le SKU doit être unique
- Le nom du produit doit être unique

### 4. Mettre à jour un produit
```
PUT /api/products/{id}
```

**Corps de la requête :**
```json
{
  "name": "Produit A Modifié",
  "description": "Nouvelle description",
  "sku": "SKU001",
  "price": 28.00,
  "purchasePrice": 16.00,
  "minStockQuantity": 12,
  "unite": "kg",
  "category": "Alimentaire",
  "productStatus": "ACTIF"
}
```

### 5. Supprimer un produit
```
DELETE /api/products/{id}
```

**Notes :**
- Supprime également l'enregistrement de stock associé
- Vérifiez qu'aucune commande n'utilise ce produit avant suppression

## Exemples d'utilisation

### Créer un produit avec React

```jsx
import React, { useState } from 'react';

const ProductForm = () => {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    purchasePrice: '',
    minStockQuantity: '',
    unite: '',
    category: '',
    productStatus: 'ACTIF',
    supplierId: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productPayload = {
      name: productData.name,
      description: productData.description,
      sku: productData.sku,
      price: parseFloat(productData.price),
      purchasePrice: parseFloat(productData.purchasePrice),
      minStockQuantity: parseInt(productData.minStockQuantity),
      unite: productData.unite,
      category: productData.category,
      productStatus: productData.productStatus,
      supplier: { id: parseInt(productData.supplierId) }
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productPayload)
      });

      if (response.ok) {
        const createdProduct = await response.json();
        alert('Produit créé avec succès !');
        console.log('Produit créé:', createdProduct);
        
        // Réinitialiser le formulaire
        setProductData({
          name: '',
          description: '',
          sku: '',
          price: '',
          purchasePrice: '',
          minStockQuantity: '',
          unite: '',
          category: '',
          productStatus: 'ACTIF',
          supplierId: ''
        });
      } else {
        alert('Erreur lors de la création du produit');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du produit');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nom du produit:</label>
        <input
          type="text"
          value={productData.name}
          onChange={(e) => setProductData({...productData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          value={productData.description}
          onChange={(e) => setProductData({...productData, description: e.target.value})}
          required
        />
      </div>

      <div>
        <label>SKU:</label>
        <input
          type="text"
          value={productData.sku}
          onChange={(e) => setProductData({...productData, sku: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Prix de vente:</label>
        <input
          type="number"
          step="0.01"
          value={productData.price}
          onChange={(e) => setProductData({...productData, price: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Prix d'achat:</label>
        <input
          type="number"
          step="0.01"
          value={productData.purchasePrice}
          onChange={(e) => setProductData({...productData, purchasePrice: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Quantité minimum en stock:</label>
        <input
          type="number"
          value={productData.minStockQuantity}
          onChange={(e) => setProductData({...productData, minStockQuantity: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Unité de mesure:</label>
        <input
          type="text"
          value={productData.unite}
          onChange={(e) => setProductData({...productData, unite: e.target.value})}
          placeholder="kg, litre, pièce, etc."
        />
      </div>

      <div>
        <label>Catégorie:</label>
        <input
          type="text"
          value={productData.category}
          onChange={(e) => setProductData({...productData, category: e.target.value})}
          required
        />
      </div>

      <div>
        <label>Statut du produit:</label>
        <select
          value={productData.productStatus}
          onChange={(e) => setProductData({...productData, productStatus: e.target.value})}
          required
        >
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
        </select>
      </div>

      <div>
        <label>ID du fournisseur:</label>
        <input
          type="number"
          value={productData.supplierId}
          onChange={(e) => setProductData({...productData, supplierId: e.target.value})}
          required
        />
      </div>

      <button type="submit">Créer le produit</button>
    </form>
  );
};

export default ProductForm;
```

### Lister tous les produits

```javascript
const getAllProducts = async () => {
  try {
    const response = await fetch('/api/products');
    
    if (response.ok) {
      const products = await response.json();
      console.log('Produits:', products);
      return products;
    } else {
      console.error('Erreur lors de la récupération des produits');
      return [];
    }
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
};

// Exemple d'utilisation
getAllProducts().then(products => {
  products.forEach(product => {
    console.log(`${product.name} - ${product.price}€`);
  });
});
```

### Mettre à jour un produit

```javascript
const updateProduct = async (productId, updatedData) => {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData)
    });

    if (response.ok) {
      const updatedProduct = await response.json();
      console.log('Produit mis à jour:', updatedProduct);
      return updatedProduct;
    } else {
      console.error('Erreur lors de la mise à jour du produit');
      return null;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

// Exemple d'utilisation
updateProduct(1, {
  name: 'Produit A Modifié',
  price: 28.00,
  minStockQuantity: 15,
  unite: 'kg',
  category: 'Alimentaire',
  productStatus: 'ACTIF'
});
```

### Supprimer un produit

```javascript
const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('Produit supprimé avec succès');
      return true;
    } else {
      console.error('Erreur lors de la suppression du produit');
      return false;
    }
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
};

// Exemple d'utilisation
deleteProduct(1);
```

## Validation

- `name` : **OBLIGATOIRE** - Nom du produit (doit être unique)
- `description` : **OBLIGATOIRE** - Description du produit
- `sku` : **OBLIGATOIRE** - Code SKU unique
- `price` : **OBLIGATOIRE** - Prix de vente (≥ 0)
- `purchasePrice` : **OBLIGATOIRE** - Prix d'achat (≥ 0)
- `minStockQuantity` : **OBLIGATOIRE** - Quantité minimum en stock (≥ 0)
- `unite` : **OPTIONNEL** - Unité de mesure du produit (kg, litre, pièce, etc.)
- `category` : **OBLIGATOIRE** - Catégorie du produit
- `productStatus` : **OBLIGATOIRE** - Statut du produit (ACTIF ou INACTIF)
- `supplier` : **OBLIGATOIRE** - Fournisseur associé

## Statuts de produit

- `ACTIF` : Le produit est disponible à la vente
- `INACTIF` : Le produit n'est plus disponible à la vente

## Codes d'erreur

- `400 Bad Request` : Données invalides
- `404 Not Found` : Produit introuvable
- `409 Conflict` : Nom ou SKU déjà existant
- `500 Internal Server Error` : Erreur serveur

## Fonctionnalités automatiques

- **Création du stock** : Un enregistrement de stock est automatiquement créé lors de la création d'un produit
- **Validation des prix** : Les prix doivent être positifs
- **Gestion des relations** : Association automatique avec le fournisseur
- **Unicité** : Le nom et le SKU doivent être uniques 