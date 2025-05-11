Select * from Listing
where SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
and LastUpdated BETWEEN '2025-03-08' and '2025-03-09'
and active =1

insert into Inventory
SELECT UUID() as Id,
    ItemTitle as Name,
    1 as Quantity,
    0 as Cost,
    0 as Weight,
    dateListed as FirstListed,
    ItemNumber as Sku
from Listing
where SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
and LastUpdated BETWEEN '2025-03-08' and '2025-03-09'
and active =1;
