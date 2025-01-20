select t.ticker, t.ticker_name, t.sector, a.*, rsi.rsi
from portfolio p
    inner join tickers t on p.ticker_id = t.id
    inner join investing.activity a on a.ticker_id = t.id	
    left join investing.rsi on  a.ticker_id = rsi.ticker_id and a.activity_date = rsi.activity_date 
where p.active = 1
and a.activity_date = '2024-07-26'
order by rsi, sector;          