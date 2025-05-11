select Name, count(Name)
from listflow.Inventory
group by Name
having count(Name) > 1;


delete from listflow.Inventory where id in(
select id
from (
	SELECT avg.id, Name,
		row_number() over (partition by  Name) row_num
	FROM listflow.Inventory avg
    order by Name

) as t 
where t.row_num > 1
);