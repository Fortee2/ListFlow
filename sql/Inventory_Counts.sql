set @startDate = '2024-06-01';
set @endDate = '2024-07-01';

-- item count during month
select count(ItemNumber)
from Listing
where  ifnull(dateListed, dateSold) < @startDate
and (dateSold > @startDate
    or dateEnded > @startDate
    or (ISNULL(DateEnded) and ISNULL(DateSold))
)
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';


--items sold during month
select count(id)
from Listing
where (dateSold  BETWEEN @startDate and @endDate);

--Items bought during month
select *
from Listing
where  ifnull(dateListed, dateSold)  BETWEEN @startDate and @endDate
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

--Items ended during month on ebay
select *
from Listing
where DateEnded  BETWEEN @startDate and @endDate
    and ISNULL(DateSold)
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

-- minus items sold on other platforms because they will just be ended ebay items
-- should give you the told number of items ended and not relist
select count(id)
from Listing
where (dateSold  BETWEEN @startDate and @endDate)
and SalesChannelId <> '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

select count(id)
from Listing
where active = 1
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';
