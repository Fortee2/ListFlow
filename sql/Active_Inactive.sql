update listflow.Listing set crosspostid = NULL where itemnumber = '175872219290';

SELECT * FROM listflow.active_inactive
order by datesold desc;    

update listflow.Listing set active = 0 where itemnumber = '1363483067';

UPDATE listflow.Listing set active = 0 where active = 1 and dateSold is not null;

select * from listflow.Listing 
where itemnumber = 'm22921426077'
order by dateSold desc;

select * from listflow.SalesChannel;
    

update listflow.Listing set active =1, datesold = null where itemnumber ='m42834175894';

update listflow.Listing set crosspostid = uuid() where itemnumber in ('m38029026701' , '186618464257' );

select  *
from listflow.Listing l
where active = true
and crosspostid is null
order by itemtitle;
