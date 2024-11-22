export default function retrieveAuctionDetails() {

    function process(){
        let serverAttribute = document.querySelector("app-loader-container").attributes[0].name;
        let timeLeft = document.querySelectorAll(`span[${serverAttribute}]`)[0].getElementsByTagName("span")[0].innerText;
        let price = document.querySelectorAll(`h3[${serverAttribute}]`)[1].innerText;
        let futureTime = calculateFutureTime(timeLeft);
        const date = Date.now();

        const endDate =  date + futureTime;
      
        console.log("futureTime: " + futureTime);
        console.log("now: " + date);
        console.log("newDate: " + endDate);

        // Prompt the user for their max bid
        const maxBid = prompt('Enter your max bid ($):');

        if (!maxBid) {
          alert('Please enter a max bid.');
        }

        return {
          itemTitle: document.querySelector('h1').innerText,
          endTime: futureTime,
          actualEndTime: endDate,   
          currentPrice: price,
          maxBid: maxBid
        }
    }

    function calculateFutureTime(timeString) {
        const timeComponents = timeString.split(" ");
        let totalMinutes = 0;
      
        for (const component of timeComponents) {
            const unit = component.slice(-1);
            const value = parseInt(component.slice(0, -1));
      
            switch (unit) {
                case "d":
                    totalMinutes += value * 24 * 60;
                    break;
                case "h":
                    totalMinutes += value * 60;
                    break;
                case "m":
                    totalMinutes += value;
                    break;
                default:
                    console.error("Unknown time unit:", unit);
            }
        }
      
        return totalMinutes * 60000;
      }
    
    return process();
}