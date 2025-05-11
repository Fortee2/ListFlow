    SELECT 
        concat(
            'UPDATE Listing l JOIN ( SELECT DISTINCT ''', l.ItemNumber, ''' as ItemNumber, ItemTitle FROM Listing WHERE ItemTitle like ''' , REPLACE(REPLACE(l.ItemTitle,"'", "''"),'...','%'), ''' AND ItemNumber != ''', l.ItemNumber, ''') AS duplicates ON l.ItemNumber = duplicates.ItemNumber SET l.ItemTitle = duplicates.ItemTitle WHERE l.ItemNumber = ''', l.ItemNumber,''';')
    FROM Listing l
    WHERE l.ItemTitle like '%...';

select * from Listing WHERE ItemNumber = '176467078514';


UPDATE Listing l JOIN ( 
    SELECT DISTINCT '176467078514' as ItemNumber, ItemTitle FROM Listing WHERE ItemTitle like 'Cobalt Iridescent Bl%' AND ItemNumber != '176467078514'
    ) AS duplicates ON l.ItemNumber = duplicates.ItemNumber SET l.ItemTitle = duplicates.ItemTitle WHERE l.ItemNumber = '176467078514';