-- =========================================================
-- Update predictor_profiles with category-specific priors
-- =========================================================

-- Update all existing predictor profiles with the new category priors
UPDATE predictor_profiles
SET config = jsonb_set(
    config,
    '{category_priors}',
    '{
        "f434dbe4-6d14-40c3-b845-157a6e07eaa3": {"mean_days": 7.0, "mad_days": 2.0},
        "247755bd-9c8a-4a85-8cb5-15f296d3f434": {"mean_days": 5.0, "mad_days": 2.0},
        "e3f118c0-510e-4572-9112-f118a3326056": {"mean_days": 5.0, "mad_days": 2.0},
        "302d4036-14b8-45e0-b5ef-9b865df23d15": {"mean_days": 5.0, "mad_days": 2.0},
        "959f3f6c-174f-417a-80b1-7083f748275b": {"mean_days": 4.0, "mad_days": 1.5},
        "bc5c6890-3361-406d-a533-f7f2564ac72d": {"mean_days": 3.5, "mad_days": 1.0},
        "ca76f11c-aaff-4161-8168-ecefb57830f4": {"mean_days": 2.5, "mad_days": 1.0},
        "be81897f-0403-434e-969a-6412ed191641": {"mean_days": 14.0, "mad_days": 5.0},
        "cbc24f9c-7ed8-4aef-904c-01d96c8abdc5": {"mean_days": 14.0, "mad_days": 5.0},
        "a98838f4-694c-40ff-87e9-5494dc8f9b21": {"mean_days": 45.0, "mad_days": 15.0},
        "bae7026d-4c9f-4a9b-a884-4749f84e5f33": {"mean_days": 60.0, "mad_days": 20.0},
        "62173c03-780f-4bfd-9669-d1c9f04678d8": {"mean_days": 90.0, "mad_days": 30.0},
        "c9040cfc-3aa9-41d3-830d-e354757f54a5": {"mean_days": 90.0, "mad_days": 30.0},
        "c80d18b4-2f29-4c4c-993c-8ab7d505ead2": {"mean_days": 120.0, "mad_days": 40.0}
    }'::jsonb
)
WHERE method = 'EMA';

-- Verify the update
SELECT 
    user_id, 
    name, 
    config->'category_priors' as category_priors
FROM predictor_profiles
WHERE method = 'EMA';

