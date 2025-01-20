START TRANSACTION;
update listflow.Listing set ItemTitle = replace(ItemTitle, '  ', ' ');
update listflow.Listing set ItemTitle = replace(ItemTitle, '&amp;', '&');
-- Step 1: Update the latest records with the earliest DateListed

UPDATE Listing l
JOIN (
    SELECT 
        ItemTitle,
        MAX(ifnull(DateListed, ifnull( DateEnded, DateSold))) AS MaxListedDate,
        MIN(ifnull(DateListed, ifnull( DateEnded, DateSold))) AS EarliestListDate
    FROM Listing
    GROUP BY ItemTitle
    HAVING COUNT(*) > 1
) AS duplicates ON l.ItemTitle = duplicates.ItemTitle 
    AND l.DateListed = duplicates.MaxListedDate
SET l.DateListed = duplicates.EarliestListDate;

-- Step 2: Delete the older duplicate records
delete from Listing
where ItemNumber in (
    select itemnumber
    from (
        select itemnumber, itemtitle, active, DateListed,
        row_number() over (PARTITION by itemtitle order by ItemTitle, active desc) as intRow
        from Listing 
        where SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
    )as duplicates
    where intRow > 1
);

COMMIT;

 