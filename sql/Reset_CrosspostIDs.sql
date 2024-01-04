update listflow.Listing set CrossPostId = null
where id in (
	SELECT Id FROM (
		select ll.id from listflow.Listing ll 
			inner join listflow.Listing l on ll.CrossPostId = l.CrossPostId
		where ll.Active = true
			and ll.CrossPostId is not null
			and (l.Active = false and l.DateEnded is not null)
	) as sq
)
;
    
