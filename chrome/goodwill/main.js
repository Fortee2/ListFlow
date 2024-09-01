function scrapGoodwill() {
    function checkReadyState() {
        return new Promise((resolve, reject) => {
            let retries = 0;
            const maxRetries = 10;

            function check() {
                if (document.readyState === "complete") {
                    console.log("readyState is complete");
                    retrieveAuction();
                    resolve();
                } else if (retries < maxRetries) {
                    console.log("readyState is not complete");
                    retries++;
                    setTimeout(check, 1000);
                } else {
                    reject(new Error("Page load timed out"));
                }
            }

            check();
        });
    }

    function retrieveAuction() {
        try {
            let serverAttribute = document.querySelector("app-loader-container").attributes[0].name;
            let timeLeft = document.querySelectorAll(`span[${serverAttribute}]`)[0].getElementsByTagName("span")[0].innerText;
            let price = document.querySelectorAll(`h3[${serverAttribute}]`)[1].innerText;
            let futureTime = calculateFutureTime(timeLeft);

            console.log("futureTime: " + futureTime);

            if (futureTime > 10000) {
                setTimeout(() => {
                    executeBid();
                }, futureTime - 10000);
            } else {
                console.error("Not enough time to place a bid");
            }

            console.log("price: " + price);
        } catch (error) {
            console.error("Error retrieving auction details:", error);
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

    function executeBid() {
        try {
            let el = document.getElementById("currentBid");
            if (el) {
                el.addEventListener("input", (e) => {
                    console.log("input event fired");
                    console.log(e.target.value);
                });
                el.addEventListener("change", (e) => {
                    console.log("change event fired");
                    console.log(e.target.value);
                });
                el.addEventListener("focus", (e) => {
                    console.log("focus event fired");
                    console.log(e.target.value);
                });
                el.addEventListener("keydown", (e) => {
                    setTimeout(() => {
                        document.querySelector('button[class="btn btn-purple btn-lg btn-block d-print-none ng-star-inserted"]').click();
                        setTimeout(() => {
                            document.querySelector('button[class="btn btn-primary ng-star-inserted"]').click();
                        }, 1000);
                    }, 1000);

                    console.log("keydown event fired");
                    console.log(e.target.value);
                });

                el.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
                el.value = parseFloat("60");
                el.dispatchEvent(new Event("input", { bubbles: true }));

                let event = new KeyboardEvent("keydown", { bubbles: true, key: "Enter" });
                el.dispatchEvent(event);
            } else {
                console.error("Bid input element not found");
            }
        } catch (error) {
            console.error("Error executing bid:", error);
        }
    }

    checkReadyState().catch(error => console.error(error));
}