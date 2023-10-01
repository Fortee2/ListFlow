select itemnumber, count(itemnumber)
from listflow.Listing
group by itemnumber
having count(itemnumber) > 1;


delete from listflow.Listing where id in(
select id
from (
	SELECT avg.id, ItemNumber,
		row_number() over (partition by  ItemNumber) row_num
	FROM listflow.Listing avg
    order by ItemNumber

) as t 
where t.row_num > 1
);

delete from listflow.ListingMetric where id in(
	select id
	from (
		SELECT avg.id, ListingId,
			row_number() over (partition by  ListingId) row_num
		FROM listflow.ListingMetric avg
		order by LastUpdated Desc

	) as t 
	where t.row_num > 1
);