select concat('UPDATE listflow.Listing SET CrossPostId = ''', e.Id, ''' WHERE ID = ''', e.Id, '''; UPDATE listflow.Listing SET CrossPostId = ''', e.Id, ''' WHERE ID = ''', m.Id, ''';')
FROM listflow.Listing e
left join listflow.Listing m on e.ItemTitle = m.ItemTitle
where e.SalesChannelId = '28e91dfe-9a9d-482d-4aed-08db50d0bd42'
and m.SalesChannelId = '1411f7bd-3872-4543-812c-f1b81569be89'
and e.CrossPostId is null
and e.active = 1
and m.active = 1;