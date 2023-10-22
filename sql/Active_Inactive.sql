	Select l.ItemNumber, l.ItemTitle, l.Active,l.dateended, l.datesold,  ll.ItemNumber,  ll.ItemTitle, ll.lastupdated, ll.Active
	from listflow.Listing l 
		right join listflow.Listing ll on l.CrossPostId = ll.CrossPostId 
	where (l.SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42' or l.SalesChannelId is null) and (ll.SalesChannelId = '1411f7bd-3872-4543-812c-f1b81569be89'  or ll.SalesChannelId is null )
	and ll.Active  = 1
    and (l.Active = 0)
    union
	Select l.ItemNumber, l.ItemTitle, l.Active,l.dateended, l.datesold, ll.ItemNumber, ll.ItemTitle, ll.lastupdated, ll.Active
	from listflow.Listing l 
		right join listflow.Listing ll on l.CrossPostId = ll.CrossPostId 
	where (l.SalesChannelId ='1411f7bd-3872-4543-812c-f1b81569be89'  or l.SalesChannelId is null) and (ll.SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'  or ll.SalesChannelId is null )
	and ll.Active  = 1
    and (l.Active = 0);
    
select  l.ItemNumber, l.ItemTitle, l.lastupdated, l.DateListed, l.dateended, l.datesold
from listflow.Listing l
where active = true
and crosspostid is null
order by datelisted, itemtitle;
    
    		