update listflow.Listing set crosspostid = NULL where itemnumber = '175872219290';

SELECT * FROM listflow.active_inactive
order by datesold desc;    
    
    
select  *
from listflow.Listing l
where active = true
and crosspostid is null
order by itemtitle;


select * from listflow.Listing 
where SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
order by dateSold desc;

select * from listflow.SalesChannel;
    