select * 
from listflow.Listing list 
	left join listflow.Inventory invent on list.CrosspostId = invent.id
where invent.Id is null;

select * from listflow.SalesChannel;
select 
	concat('INSERT INTO listflow.Inventory ( Name, Quantity, Cost, Weight, FirstListed, Sku) VALUES ( ''', 
    itemTitle, 
    ''', 0, 0, 0,''', 
	dateListed,
 ''', ''',
 itemNumber,
 ''');'  
)
from listflow.Listing list 
	left join listflow.Inventory invent on list.CrosspostId = invent.id
where 
	invent.Id is null
	and salesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

