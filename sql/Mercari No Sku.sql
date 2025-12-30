select * from Inventory
where Sku = 'cc6781ed-4332-4555-b1c5-3439adb81110';

select * from Inventory
where name like '%Wenger%';


Select * from Listing 
where ItemNumber = 'm43084285344';

select l.ItemNumber, i.Sku
from Listing l 
inner join Inventory i on l.CrossPostId = i.Id
inner join SalesChannel sc on l.SalesChannelId = sc.Id
Where sc.Name = 'Mercari'
	and l.Active = 1
    and not l.Description like concat('%[', i.Sku, ']');