select concat('INSERT INTO listflow.Inventory (Id, Name, Quantity, Cost, Weight, FirstListed) VALUES (''',
 CrossPostId, 
 ''', ''Inventoy Item'', 0, 0, 0,''', 
 min(DateListed), 
 ''');'  
)
from listflow.Listing
where CrossPostId is not null
	and DateListed is not null
group by CrossPostId
order by CrossPostId;

