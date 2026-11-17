-- =============================================================================
-- Sample catalogue for مكتبة أسماء النموذجية
-- Placeholders only: replace categories, brands, products and gallery from the
-- admin dashboard. Image values are placeholder keys resolved by src/lib/media.ts.
-- Safe to re-run (on conflict do nothing).
-- =============================================================================

insert into public.categories (slug, name_ar, name_en, description, description_en, image_url, display_order) values
  ('bags',      'الحقائب والمقلمات',     'Bags & Pencil Cases',        'حقائب ظهر مدرسية ومقلمات بتقسيمات عملية.',          'School backpacks, trolley bags and pencil cases.',       'cat-bags',      1),
  ('notebooks', 'الكشاكيل والدفاتر',     'Notebooks & Copybooks',      'دفاتر سلك وكراسات مدرسية ومفكرات.',                  'Spiral notebooks, copybooks and journals.',              'cat-notebooks', 2),
  ('pens',      'الأقلام وأدوات الكتابة', 'Pens & Writing Instruments', 'أقلام جاف وحبر ورصاص وأقلام تظليل.',                 'Ballpoint, fountain and graphite pens, highlighters.',   'cat-pens',      3),
  ('geometry',  'الأدوات الهندسية',      'Geometry & Drafting',        'أطقم هندسية ومساطر ومثلثات وفرجار.',                 'Geometry sets, rulers, set squares and compasses.',      'cat-geometry',  4),
  ('art',       'أدوات الرسم والفنون',    'Art & Drawing Supplies',     'ألوان خشبية ومائية وكراسات رسم وفُرش.',               'Coloured pencils, watercolours, sketchbooks, brushes.',  'cat-art',       5),
  ('office',    'مستلزمات المكتب',       'Office Supplies',            'منظمات مكتب ودباسات وآلات حاسبة وورق تصوير.',         'Desk organisers, staplers, calculators and copy paper.', 'cat-office',    6)
on conflict (slug) do nothing;

insert into public.brands (slug, name, name_en, description, logo_url) values
  ('one',   'علامة تجارية ١', 'Brand 1', 'علامة تجريبية — استبدلها من لوحة الإدارة.', 'brand-1'),
  ('two',   'علامة تجارية ٢', 'Brand 2', 'علامة تجريبية — استبدلها من لوحة الإدارة.', 'brand-2'),
  ('three', 'علامة تجارية ٣', 'Brand 3', 'علامة تجريبية — استبدلها من لوحة الإدارة.', 'brand-3'),
  ('four',  'علامة تجارية ٤', 'Brand 4', 'علامة تجريبية — استبدلها من لوحة الإدارة.', 'brand-4')
on conflict (slug) do nothing;

insert into public.products (
  slug, name_ar, name_en, short_description, short_description_en, description, description_en,
  category_id, brand_id, age_stage, sku, specifications, main_image, is_featured, seo_title, seo_description, created_at
)
select
  v.slug, v.name_ar, v.name_en,
  v.name_ar || ' متوفر لدى مكتبة أسماء النموذجية.',
  v.name_en || ' available at Asmaa Model Library.',
  'استفسر عن ' || v.name_ar || ' عبر واتساب لمعرفة التوفر والسعر والخيارات المتاحة.',
  'Ask about the ' || v.name_en || ' on WhatsApp for availability, price and options.',
  c.id, b.id, v.age, 'ASM-' || (100 + v.n),
  jsonb_build_array(
    jsonb_build_object('label_ar', 'القسم', 'label_en', 'Category', 'value_ar', c.name_ar, 'value_en', c.name_en),
    jsonb_build_object('label_ar', 'المرحلة الدراسية', 'label_en', 'Stage',
      'value_ar', case v.age when 'primary' then 'المرحلة الابتدائية' when 'preparatory' then 'المرحلة الإعدادية' else 'المرحلة الثانوية والجامعية' end,
      'value_en', case v.age when 'primary' then 'Primary' when 'preparatory' then 'Preparatory' else 'Secondary & university' end)
  ),
  v.img, v.n < 8,
  v.name_ar || ' | مكتبة أسماء النموذجية',
  'استعرض ' || v.name_ar || ' لدى مكتبة أسماء النموذجية واستفسر عنه عبر واتساب.',
  now() - make_interval(hours => v.n)
from (values
  (0,  'backpack-classic',      'حقيبة ظهر مدرسية',      'School backpack',                'bags',      'one',   'primary',     'c-1'),
  (1,  'backpack-wheels',       'حقيبة بعجل',            'Trolley bag',                    'bags',      'two',   'primary',     'c-2'),
  (2,  'pencil-case-fabric',    'مقلمة قماش',            'Fabric pencil case',             'bags',      'one',   'preparatory', 'c-3'),
  (3,  'notebook-a4-100',       'كشكول سلك A4 ‏١٠٠ ورقة', 'A4 spiral notebook, 100 sheets', 'notebooks', 'three', 'preparatory', 'c-4'),
  (4,  'notebook-a5-leather',   'مفكرة جلدية A5',        'A5 leather notebook',            'notebooks', 'four',  'secondary',   'c-5'),
  (5,  'copybook-60',           'كراسة ٦٠ ورقة',         '60-sheet copybook',              'notebooks', 'three', 'primary',     'c-6'),
  (6,  'pen-ballpoint-blue',    'قلم جاف أزرق',          'Blue ballpoint pen',             'pens',      'two',   'preparatory', 'c-7'),
  (7,  'pen-fountain-metal',    'قلم حبر معدني',         'Metal fountain pen',             'pens',      'four',  'secondary',   'c-8'),
  (8,  'pencil-set-hb',         'طقم أقلام رصاص',        'Pencil set',                     'pens',      'one',   'primary',     'c-9'),
  (9,  'geometry-set-4',        'طقم أدوات هندسية',      'Geometry set',                   'geometry',  'two',   'preparatory', 'c-10'),
  (10, 'ruler-30',              'مسطرة ٣٠ سم',           '30 cm ruler',                    'geometry',  'two',   'primary',     'c-11'),
  (11, 'colour-pencils-24',     'ألوان خشبية ٢٤ لون',    'Coloured pencils, 24',           'art',       'three', 'primary',     'c-12'),
  (12, 'watercolour-12',        'ألوان مائية ١٢ لون',    'Watercolours, 12',               'art',       'three', 'primary',     'c-13'),
  (13, 'sketchbook-a3',         'كراسة رسم A3',          'A3 sketchbook',                  'art',       'four',  'secondary',   'c-14'),
  (14, 'stapler-desk',          'دبّاسة مكتب',           'Desk stapler',                   'office',    'one',   'secondary',   'c-15'),
  (15, 'calculator-scientific', 'آلة حاسبة علمية',       'Scientific calculator',          'office',    'four',  'secondary',   'c-16'),
  (16, 'organiser-desk',        'منظّم مكتب',            'Desk organiser',                 'office',    'one',   'secondary',   'c-17'),
  (17, 'copy-paper-a4',         'ورق تصوير A4',          'A4 copy paper',                  'office',    'three', 'secondary',   'c-18')
) as v(n, slug, name_ar, name_en, cat, brand, age, img)
left join public.categories c on c.slug = v.cat
left join public.brands b on b.slug = v.brand
on conflict (slug) do nothing;

insert into public.gallery (title, title_en, image_url, display_order)
select v.t, v.t_en, v.img, v.o from (values
  ('تشكيلة الدفاتر والكشاكيل',   'Notebooks & copybooks',      'gallery-1', 1),
  ('ركن الأقلام والأدوات الهندسية', 'Pens & geometry tools',      'gallery-2', 2),
  ('ألوان وكراسات الرسم',         'Colours & sketchbooks',      'gallery-3', 3),
  ('مستلزمات وتنظيم المكاتب',     'Office supplies',            'gallery-4', 4),
  ('الحقائب المدرسية والمقلمات',   'School bags & pencil cases', 'gallery-5', 5)
) as v(t, t_en, img, o)
where not exists (select 1 from public.gallery);
