SELECT l.Id, 
    cp.ItemTitle as Title, 
    cp.Description, 
    if(l.Active, 'in stock', 'out of stock') as 'availability',
    'used' as `condition`,    
    concat(cp.price, ' USD') as price,
    concat('https://www.ebay.com/itm/', l.ItemNumber) as link,
    concat('https://u-mercari-images.mercdn.net/photos/', cp.ItemNumber, '_1.jpg') as image_link,
    'Moondoor' as 'brand',
    1 as 'quantity_to_sell_on_facebook',
    'Ground' as shipping
from Listing l
inner join Listing cp on l.CrossPostId = cp.CrossPostId
left join Postage p on p.Id = l.Id
where 
l.SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
and cp.SalesChannelId = '1411f7bd-3872-4543-812c-f1b81569be89'
and `l`.`active` = 1
and cp.ItemTitle <> `cp`.`Description`
and not `cp`.`description` like '%...'
UNION
SELECT l.Id, 
    cp.ItemTitle as Title, 
    cp.Description, 
    if(l.Active, 'in stock', 'out of stock') as 'availability',
    'used' as `condition`,    
    concat(cp.price, ' USD') as price,
    concat('https://www.ebay.com/itm/', l.ItemNumber) as link,
    concat('https://u-mercari-images.mercdn.net/photos/', cp.ItemNumber, '_1.jpg') as image_link,
    'Moondoor' as 'brand',
    1 as 'quantity_to_sell_on_facebook',
    'Ground' as shipping
from Listing l
inner join Listing cp on l.CrossPostId = cp.CrossPostId
left join Postage p on p.Id = l.Id
where 
l.SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
and cp.SalesChannelId = '1411f7bd-3872-4543-812c-f1b81569be89'
and `l`.`active` = 0
and cp.ItemTitle <> `cp`.`Description`
and not `cp`.`description` like '%...'
and IFNULL(l.DateEnded,l.DateSold) BETWEEN Date_Sub(now(), INTERVAL 30 DAY) and now()

