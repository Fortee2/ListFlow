SELECT sc.Name As 'Sold/Ended On',  ai.itemnumber, ai.ItemTitle, ai.dateEnded, ai.datesold, scc.Name As 'Still On', ai.CPitemnumber, ai.CPTitle
FROM listflow.active_inactive ai
    inner JOIN listflow.SalesChannel sc on ai.soldChannel = sc.id
    inner JOIN listflow.SalesChannel scc on ai.cpSalesChannel = scc.id
order by datesold desc;    



select * from Listing 
order by ItemTitle, DateListed;


UPDATE Listing set CrossPostId = null where ItemTitle like '%Perfect Mason%'

select * from Listing where ItemTitle like '%Perfect Mason%'