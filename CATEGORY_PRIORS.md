# 📊 Category Priors Configuration

## Overview
The Smart Pantry AI uses **category-specific priors** to provide better predictions for how long products will last based on their type.

## Category Priors Table

| Category | Category ID | Mean Days | MAD Days | Rationale |
|----------|-------------|-----------|----------|-----------|
| **Dairy & Eggs** | `f434dbe4-6d14-40c3-b845-157a6e07eaa3` | 7.0 | 2.0 | Typical milk/yogurt shelf life |
| **Bread & Bakery** | `247755bd-9c8a-4a85-8cb5-15f296d3f434` | 5.0 | 2.0 | Fresh bread lasts ~5 days |
| **Bread** | `e3f118c0-510e-4572-9112-f118a3326056` | 5.0 | 2.0 | Same as bakery |
| **Vegetables** | `302d4036-14b8-45e0-b5ef-9b865df23d15` | 5.0 | 2.0 | Fresh veggies vary |
| **Fruits** | `959f3f6c-174f-417a-80b1-7083f748275b` | 4.0 | 1.5 | Fruits spoil faster |
| **Meat & Poultry** | `bc5c6890-3361-406d-a533-f7f2564ac72d` | 3.5 | 1.0 | Raw meat is perishable |
| **Fish & Seafood** | `ca76f11c-aaff-4161-8168-ecefb57830f4` | 2.5 | 1.0 | Most perishable |
| **Snacks** | `be81897f-0403-434e-969a-6412ed191641` | 14.0 | 5.0 | Packaged snacks last longer |
| **Beverages** | `cbc24f9c-7ed8-4aef-904c-01d96c8abdc5` | 14.0 | 5.0 | Juices/drinks last ~2 weeks |
| **Frozen Foods** | `a98838f4-694c-40ff-87e9-5494dc8f9b21` | 45.0 | 15.0 | Frozen extends shelf life |
| **Grains & Pasta** | `bae7026d-4c9f-4a9b-a884-4749f84e5f33` | 60.0 | 20.0 | Dry goods last months |
| **Spices & Seasonings** | `62173c03-780f-4bfd-9669-d1c9f04678d8` | 90.0 | 30.0 | Spices last very long |
| **Condiments & Sauces** | `c9040cfc-3aa9-41d3-830d-e354757f54a5` | 90.0 | 30.0 | Condiments are stable |
| **Canned & Jarred** | `c80d18b4-2f29-4c4c-993c-8ab7d505ead2` | 120.0 | 40.0 | Longest shelf life |

## Parameters Explained

### `mean_days`
The expected average number of days a product in this category will last from purchase to consumption/depletion.

### `mad_days` (Mean Absolute Deviation)
The expected variation in consumption patterns. Lower values mean more consistent consumption.

## How It Works

1. **New Product**: When a product is added without consumption history, the AI uses the category prior as the starting point.

2. **Learning**: As the user consumes products, the AI learns the actual consumption pattern using EMA (Exponential Moving Average).

3. **Convergence**: Over time, the prediction converges from the category prior to the user's actual behavior.

## Example

**Milk** (Dairy & Eggs category):
- **Initial prediction**: 7 days (category prior)
- **After user consumes in 5 days**: Prediction adjusts to ~6 days
- **After multiple cycles**: Prediction becomes personalized (e.g., 5.2 days for this household)

## Updating Priors

To update category priors for all users:

```bash
# Run the SQL script in Supabase SQL Editor
cat update_category_priors.sql
```

Or the backend will automatically use the new priors for new users.

## Impact

✅ **Better initial predictions** for new products  
✅ **Faster convergence** to accurate predictions  
✅ **More realistic forecasts** based on food science  
✅ **Reduced "UNKNOWN" states** in the UI

