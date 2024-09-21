-- item count during month
select count(ItemNumber)
from Listing
where  ifnull(dateListed, dateSold) < '2024-08-01'
and (dateSold > '2024-08-01'
    or dateEnded > '2024-08-01'
    or (ISNULL(DateEnded) and ISNULL(DateSold))
)
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';


--items sold during month
select count(id)
from Listing
where (dateSold  BETWEEN '2024-08-01' and '2024-09-01');

--Items bought during month
select *
from Listing
where  ifnull(dateListed, dateSold)  BETWEEN  '2024-08-01' and '2024-09-01'
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

--Items ended during month on ebay
select *
from Listing
where DateEnded  BETWEEN '2024-08-01' and '2024-09-01'
    and ISNULL(DateSold)
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

-- minus items sold on other platforms because they will just be ended ebay items
-- should give you the told number of items ended and not relist
select count(id)
from Listing
where (dateSold  BETWEEN '2024-08-01' and '2024-09-01')
and SalesChannelId <> '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

select count(id)
from Listing
where active = 1
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';



update Listing set DateListed = DATE_SUB(DateSold, INTERVAL 2 MONTH )
WHERE DateListed is null and DateSold is not null;

select *
from Listing
where DateListed is null
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

