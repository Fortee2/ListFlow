select * 
from Listing 
where id = 'a8869a3a-fa9c-4b36-bb35-ef3a28786170';


delete from Inventory 
where Id in (
select Id
From (
	select *,
	row_number() over (PARTITION by Name order by Name) as intRow
	from Inventory
) as dup
where intRow > 1) ;

delete from Inventory
where Id in (
	'1b13cb95-3441-11f0-9c9c-12c1c7382e63',
    'b8b0d00b-9016-47ef-a167-c9d9778c9a72',
    'f9488393-b479-4ff6-9502-9bb63278d116',
    '9168488c-750d-480e-ae48-d8d3e473db30'
)