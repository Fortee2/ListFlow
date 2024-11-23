update listflow.Listing set crosspostid = NULL where itemnumber = '175872219290';

SELECT * FROM listflow.active_inactive
order by datesold desc;    

select * from listflow.Listing 
<<<<<<< HEAD
where itemtitle like '%starcraft%'
order by dateSold desc;


update listflow.Listing set active =1, datesold = null where itemnumber ='m42834175894';

update listflow.Listing set crosspostid = uuid() where itemnumber in ('m38029026701' , '186618464257' );

select  *
from listflow.Listing l
where active = true
and crosspostid is null
order by itemtitle;
=======
where itemnumber = 'm20598766426'
order by dateSold desc;
>>>>>>> main
