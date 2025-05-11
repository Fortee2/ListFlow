update listflow.Listing set ItemTitle = replace(ItemTitle, '  ', ' ');
update listflow.Listing set ItemTitle = replace(ItemTitle, '&amp;', '&');

update listflow.Inventory set Name = replace(Name, '  ', ' ');
update listflow.Inventory set Name = replace(Name, '&amp;', '&');

select concat('UPDATE listflow.Listing SET LastUpdated = now(), CrossPostId = ''', m.Id, ''' WHERE ID = ''', e.Id, ''';')
FROM listflow.Listing e
inner join listflow.Inventory m on lcase(trim(e.ItemTitle)) = lcase(trim(m.Name))
where m.Id is not null and e.CrossPostId is null
order by m.Id; 

