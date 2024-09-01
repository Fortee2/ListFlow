START TRANSACTION;

-- Step 1: Update the latest records with the earliest DateListed
UPDATE Listing l
JOIN (
    SELECT 
        ItemTitle,
        SalesChannelId,
        MAX(DateListed) AS MaxLastUpdated,
        MIN(DateListed) AS EarliestDateListed
    FROM Listing
    GROUP BY ItemTitle, SalesChannelId
    HAVING COUNT(*) > 1
) AS duplicates ON l.ItemTitle = duplicates.ItemTitle 
    AND l.SalesChannelId = duplicates.SalesChannelId
    AND l.DateListed = duplicates.MaxLastUpdated
SET l.DateListed = duplicates.EarliestDateListed;

-- Step 2: Delete the older duplicate records
DELETE l FROM Listing l
INNER JOIN (
    SELECT 
        ItemTitle,
        SalesChannelId,
        MAX(DateListed) AS MaxLastUpdated
    FROM Listing
    GROUP BY ItemTitle, SalesChannelId
    HAVING COUNT(*) > 1
) AS latest ON l.ItemTitle = latest.ItemTitle
    AND l.SalesChannelId = latest.SalesChannelId
WHERE l.DateListed < latest.MaxLastUpdated;

COMMIT;

delete from Listing
where ItemNumber in (
    select itemnumber
    from (
        select itemnumber, itemtitle, 
        row_number() over (PARTITION by itemtitle order by itemnumber desc) as intRow
        from Listing 
        where SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
    )as duplicates
    where intRow > 1
)
;

   select itemnumber, itemtitle, intRow
    from (
        select itemnumber, itemtitle, 
        row_number() over (PARTITION by itemtitle order by itemnumber desc) as intRow
        from Listing 
        where  SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
    )as duplicates
    where intRow > 1;

select * 
from Listing 
where itemtitle = 'I SURVIVED - Lot of 3 Scholastic Chapter Books Lauren Tarshis Kids Series 1 HC'
 and SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
order by itemnumber desc;