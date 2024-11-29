SELECT sc.Name As 'Sold/Ended On',  ai.itemnumber, ai.ItemTitle, ai.dateEnded, ai.datesold, scc.Name As 'Still On', ai.CPitemnumber, ai.CPTitle
FROM listflow.active_inactive ai
    inner JOIN listflow.SalesChannel sc on ai.soldChannel = sc.id
    inner JOIN listflow.SalesChannel scc on ai.cpSalesChannel = scc.id
order by datesold desc;    

select sc.Name, ai.* 
from Listing ai
 inner JOIN listflow.SalesChannel sc on ai.SalesChannelId = sc.id
where active =1 
and CrossPostId  is null
Order by ItemTitle, dateListed;
