	Select l.ItemNumber, l.ItemTitle, l.Active,l.price, ll.price,  ll.ItemNumber,  ll.ItemTitle, ll.lastupdated, ll.Active
	from listflow.Listing l 
		left join listflow.Listing ll on l.CrossPostId = ll.CrossPostId 
	where (l.SalesChannelId = '1411f7bd-3872-4543-812c-f1b81569be89' or l.SalesChannelId is null) and (ll.SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'   or ll.SalesChannelId is null )
	and (ll.Active  = 1 or  ll.Active is null)
    and (l.Active = 1)
    and ll.price < l.price
    order by ll.price;
    
    
select * from listflow.Listing l
where l.SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
and l.Active = 1 ;


select * from listflow.Listing
where ItemTitle like '%vera%pixie%'
and Active = 1;

update  listflow.Listing l set crosspostid = null
where l.SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
and active = 0
and dateEnded between '2023-11-20' and '2023-11-26';