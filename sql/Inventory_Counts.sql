set @startDate = '2025-01-01';
set @endDate = '2025-02-01';

-- item count during month
select count(Id) as itemsAtStartOfMonth
from Inventory
where  ifnull(FirstListed, SoldDate) < @startDate
and (SoldDate > @startDate
    or EndedDate > @startDate
    or (ISNULL(EndedDate) and ISNULL(SoldDate))
)
order by Name;

-- items sold during month
select count(id) as itemsSoldDuringMonth
from Listing
where (dateSold  BETWEEN @startDate and @endDate);

-- items sold during month
select count(id) as itemsSoldDuringMonth
from Inventory
where (SoldDate  BETWEEN @startDate and @endDate);

-- Items bought during month
select count(id) as itemsBoughtDuringMonth
from Listing
where  ifnull(dateListed, dateSold)  BETWEEN @startDate and @endDate
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

-- Items ended during month on ebay
select count(id) as itemsEndedDuringMonth
from Listing
where DateEnded  BETWEEN @startDate and @endDate
    and ISNULL(DateSold)
and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42';

-- minus items sold on other platforms because they will just be ended ebay items
-- should give you the told number of items ended and not relist
select count(id) as minusItemsSoldOnOtherPlatforms
from Listing
where (dateSold  BETWEEN @startDate and @endDate)
and SalesChannelId <> '28e91dfe-9a9d-482d-4aed-08db50d0bd42';


