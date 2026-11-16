-- Sample content for development. Safe to delete from the dashboard once real products are added.

insert into public.categories (name_ar, name_en, slug, description_ar, description_en, accent, sort_order) values
 ('أدوات مدرسية','School supplies','school-supplies','دفاتر، أقلام، حقائب، مقالم، أدوات هندسية','Notebooks, pens, bags, pencil cases, geometry sets','pencil',1),
 ('أدوات مكتبية','Office supplies','office-supplies','ورق، ملفات، دبّاسات، منظّمات مكتب، آلات حاسبة','Paper, files, staplers, desk organisers, calculators','ruler',2),
 ('أدوات فنية ورسم','Art & drawing','art-drawing','ألوان خشبية ومائية، فُرش، كراسات رسم، ماركرز','Coloured pencils, watercolours, brushes, sketchbooks, markers','eraser',3),
 ('وسائل تعليمية','Educational supplies','educational-supplies','كتب تعليمية، بطاقات تعلّم، ألعاب تعليمية','Educational books, learning cards, educational games','marker',4);

insert into public.brands (name_ar, name_en, slug, sort_order) values
 ('ماركة تجريبية 1','Sample Brand 1','sample-brand-1',1),
 ('ماركة تجريبية 2','Sample Brand 2','sample-brand-2',2);

insert into public.products (category_id, brand_id, name_ar, name_en, slug, short_description_ar, short_description_en, is_featured, is_published, published_at)
select c.id, b.id, v.name_ar, v.name_en, v.slug, 'منتج تجريبي لعرض شكل الموقع.', 'Sample product used to preview the site.', v.featured, v.published, case when v.published then now() end
from (values
 ('school-supplies','sample-brand-1','دفتر سلك A4، 100 ورقة','A4 spiral notebook, 100 sheets','a4-spiral-notebook-100',true,true),
 ('school-supplies','sample-brand-2','حقيبة ظهر مدرسية','School backpack','school-backpack',true,true),
 ('school-supplies','sample-brand-1','مقلمة قماش','Fabric pencil case','fabric-pencil-case',false,true),
 ('school-supplies',null,'طقم أقلام رصاص','Pencil set','pencil-set',false,true),
 ('art-drawing','sample-brand-2','ألوان خشبية، 24 لون','Coloured pencils, 24 colours','coloured-pencils-24',true,true),
 ('art-drawing','sample-brand-1','كراسة رسم A3','A3 sketchbook','a3-sketchbook',false,true),
 ('office-supplies','sample-brand-2','آلة حاسبة علمية','Scientific calculator','scientific-calculator',true,true),
 ('office-supplies','sample-brand-1','دبّاسة مكتب','Desk stapler','desk-stapler',false,true),
 ('educational-supplies',null,'بطاقات تعلّم الحروف','Alphabet learning cards','alphabet-learning-cards',false,true),
 ('office-supplies',null,'منتج غير منشور (اختبار)','Unpublished product (test)','unpublished-test-product',false,false)
) as v(cat, brand, name_ar, name_en, slug, featured, published)
join public.categories c on c.slug = v.cat
left join public.brands b on b.slug = v.brand;

insert into public.product_variants (product_id, group_ar, group_en, value_ar, value_en, sort_order)
select p.id, 'المقاس', 'Size', s.v, s.v, s.o
from public.products p, (values ('A4',1),('A5',2),('B5',3)) as s(v, o)
where p.slug = 'a4-spiral-notebook-100';

insert into public.product_specifications (product_id, label_ar, label_en, value_ar, value_en, sort_order)
select p.id, 'عدد الورق', 'Sheets', '100 ورقة', '100 sheets', 1
from public.products p
where p.slug in ('a4-spiral-notebook-100', 'unpublished-test-product');
