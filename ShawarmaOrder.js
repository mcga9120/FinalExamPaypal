const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  SIZE: Symbol("size"),
  MEALS: Symbol("meals"),
  DRINKS: Symbol("drinks"),
  PAYMENT: Symbol("payment")
});

module.exports = class ShwarmaOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSize = "";
    this.sMeals = "";
    this.sDrinks = "";
    this.sItem = "meal";
  }
  handleInput(sInput) {
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.SIZE;
        aReturn.push("Welcome to Rory's Popup.");
        aReturn.push("Here are the current upcoming meals:");
        aReturn.push("Charcuterie Board on May 24 2021");
        aReturn.push("Broccoli Cheddar Soup and Bread on May 9 2021");
        aReturn.push("Dessert Sampler on June 20 2021");
        aReturn.push("Type READY when your ready to order");
        break;
      case OrderState.SIZE:
        this.stateCur = OrderState.MEALS
        this.sSize = sInput;
        aReturn.push("What meal would you like?");
        break;
      case OrderState.MEALS:
        this.stateCur = OrderState.PAYMENT;
        if (sInput.toLowerCase() != "no") {
          this.sMeals = sInput;
        }
        aReturn.push("Thank-you for your order of");
        aReturn.push(`${this.sMeals}`);

        //calculate $ for order

        if (this.sMeals.toLowerCase().includes("charcuterie board")) {
          {
            this.nOrder = 14;
          }
        } else if (this.sMeals.toLowerCase().includes("broccoli cheddar soup")) {
          this.nOrder = 22;
        }
        if (this.sMeals.toLowerCase().includes("dessert sampler")) {
          this.nOrder = 12;
        }

        
        aReturn.push(`Please pay $${this.nOrder} for your order here`);
        aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        break;
      case OrderState.PAYMENT:
        console.log(sInput);
        this.isDone(true);
        aReturn.push("Thank you for placing an order! We will call you closer to the pick-up date to let you know when your order is ready!")
        break;
    }
    return aReturn;
  }
  renderForm(sTitle = "-1", sAmount = "-1") {
    // your client id should be kept private
    if (sTitle != "-1") {
      this.sItem = sTitle;
    }
    if (sAmount != "-1") {
      this.nOrder = sAmount;
    }
    const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
    return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

  }
}