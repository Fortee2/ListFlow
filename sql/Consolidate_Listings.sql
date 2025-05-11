use listflow;
START TRANSACTION;

-- Step 1: Update the latest records with the earliest DateListed

/*UPDATE Listing l
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
SET l.DateListed = duplicates.EarliestListDate
WHERE duplicates.MaxListedDate <> duplicates.EarliestListDate; */

Update Inventory i 
join (
	  SELECT 
		MAX(ifnull(DateListed, ifnull( DateEnded, DateSold))) AS MaxListedDate,
		MIN(ifnull(DateListed, ifnull( DateEnded, DateSold))) AS EarliestListDate,
        CrossPostId
    FROM Listing
    Where CrossPostId is not null
    GROUP BY CrossPostId
    order by CrossPostId
) as l on i.id = l.CrossPostId
set i.FirstListed = l.EarliestListDate
WHERE l.EarliestListDate <> i.FirstListed or i.FirstListed is null;
-- Set EndedDates 
Update Inventory i 
join  (
  SELECT 
		MAX(DateEnded) AS MaxEndedDate,
		MIN(DateEnded) AS EarliestEndedDate,
		MAX(DateSold) AS MaxSold,
		MIN(DateSold) AS MinSold,
        CrossPostId
    FROM Listing
    Where CrossPostId is not null
    GROUP BY CrossPostId
    HAVING COUNT(*) > 1
    order by CrossPostId
) as l on i.id = l.CrossPostId
set i.SoldDate = l.MaxSold
WHERE i.SoldDate is null;

-- Step 2: Archive Listings before removing duplicates
INSERT INTO ListingArchive
SELECT * from Listing
where ItemNumber in (
    select itemnumber
    from (
        select itemnumber, itemtitle, active, DateListed,
        row_number() over (PARTITION by itemtitle order by ItemTitle, active desc) as intRow
        from Listing l
        inner join Inventory i on l.CrossPostID = i.Id
        where SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42' and DateSold is null
    )as duplicates
    where intRow > 1
);

-- Step 3: Delete the older duplicate records
delete from Listing
where ItemNumber in (
    select itemnumber
    from (
        select itemnumber, itemtitle, active, DateListed,
        row_number() over (PARTITION by itemtitle order by ItemTitle, active desc) as intRow
        from Listing l
        inner join Inventory i on l.CrossPostID = i.Id
        where SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42' and DateSold is null
    )as duplicates
    where intRow > 1
);

COMMIT;



 