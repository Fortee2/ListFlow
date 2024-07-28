set @anchor = '73cb1ee5-9edb-4d1d-b62e-59366809cd23'
set @target = '4e2e6827-d633-48f6-a568-633f17191899'
UPDATE listflow.Listing SET CrossPostId = @anchor WHERE ID = @anchor; UPDATE listflow.Listing SET CrossPostId = @anchor WHERE ID = @target;
    
select  *
from listflow.Listing l
where active = true
and crosspostid is null
order by itemtitle;
