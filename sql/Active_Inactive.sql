SELECT * FROM listflow.active_inactive
order by datesold desc;    
    
    
select  *
from listflow.Listing l
where active = true
and crosspostid is null
order by itemtitle;
    