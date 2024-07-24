document.addEventListener("alpine:init", () => {
  Alpine.data("pizzaCart", () => {
    return {
      tittle: "Pizza Cart API",
showHistory: false,
      pizzas: [],
      username: "",
      // cartId: 'JMcOcinSZk',
      cartId: "",
      cartPizzas: [],
      showCart: false,
      cartTotal: 0.0,
      paymentAmount: "",
      message: "",
      featuredPizzas: [],
      pizzaId: 0,
      cartData: [],
      login() {
        if (this.username.length > 2) {
         this.setFeaturedPizza(this.pizzaId);
          this.createCart();
          
        } else {
          alert("username is too short");
        }
      },
      logout() {
        if (confirm("Do you want to logout?")) {
          this.username = "";
          localStorage["cartId"] = "";
        }
      },

      startConfetti() {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      },

      scrollUp() {
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      createCart() {
        if (!this.username) {
          // this.cartId =  'No username to create a cart for'
          return;
        }

        const cartId = localStorage["cartId"];
        if (cartId) {
          this.cartId = cartId;
        } else {
          const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
          return axios.get(createCartURL).then((result) => {
            this.cartId = result.data.cart_code;
            localStorage.setItem("cartId", this.cartId);
          });
        }
        console.log({ cartId: this.cartId });
      },
      getCart() {
        const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
        return axios.get(getCartURL);
      },
      showCartData() {
        this.getCart().then((result) => {
          this.cartData = result.data;
          this.cartPizzas = this.cartData.pizzas;
          this.cartTotal = this.cartData.total.toFixed(2);
        });
      },
      addPizza(pizzaId) {
        return axios
          .post("https://pizza-api.projectcodex.net/api/pizza-cart/add", {
            cart_code: this.cartId,
            pizza_id: pizzaId,
          })
          .then(function (result) {
            console.log(result);
            return result;
          });
        // .then (() => {
        //     this.showCartData();
        // })
      },
      pay(amount) {
        return axios.post(
          "https://pizza-api.projectcodex.net/api/pizza-cart/pay",
          {
            cart_code: this.cartId,
            amount,
          }
        );
      },

      removePizza(pizzaId) {
        return axios.post(
          "https://pizza-api.projectcodex.net/api/pizza-cart/remove",
          {
            cart_code: this.cartId,
            pizza_id: pizzaId,
          }
        );
      },

      getFeaturedPizzas() {
        const featuredPizzasURL = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=${this.username}`;
        axios
          .get(featuredPizzasURL, { headers: { "Cache-control": "no-store" } })
          .then((response) => {
            // console.log(response.data);
            if (response.data && Array.isArray(response.data.pizzas)) {
              this.featuredPizzas = response.data.pizzas.slice(0, 3);
            } else {
              this.featuredPizzas = [];
            }
          });
      },
      setFeaturedPizza(pizza_id) {
        axios
          .post(
            "https://pizza-api.projectcodex.net/api/pizzas/featured",
            {
              username: this.username,
              pizza_id: pizza_id,
            },
            { headers: { "Cache-Control": "no-store" } }
          )
          .then(() => {
            // console.log(this.getFeaturedPizzas());
            this.getFeaturedPizzas();
          });
      },

      init() {
        axios
          .get(`https://pizza-api.projectcodex.net/api/pizzas`)
          .then((result) => {
            this.pizzaId = result.data.pizzas[0].id;
            this.pizzas = result.data.pizzas;
          });
          if (!this.cartId) {
            // this.setFeaturedPizza(this.pizzaId);
            this.createCart();
            this.showCartData();
            // });
          }
          this.showCartData(); 
          console.log(this.getFeaturedPizzas());
       
        // console.log({ cartId: this.cartId });
      },

      // addPizzaToCart(shoppingCart()) {
      //     // alert(pizzaId)
      //     this.addPizza(pizzaId)
      //         .then(() => {
      //             this.showCartData();
      //         })

      // },


      addPizzaToCart(pizzaId) {
        // alert(pizzaId)
        this.addPizza(pizzaId).then(() => {
          this.showCartData();
        });
      },
      payForCart() {
        // alert("Pay Now!") 
        // this. shoppingCart(paymentAmount);
        this.pay(this.paymentAmount).then((result) => {
          if (result.data.status == "failure") {
            this.message = result.data.message;
            setTimeout(() => (this.message = ""), 3000);
          } else {
            this.message = "Payment Recieved!";

            this.startConfetti();
            localStorage.setItem("History", JSON.stringify(this.cartData));

            setTimeout(() => {
              this.message = "";
              this.cartPizzas = [];
              this.cartTotal = 0.0;
              this.cartId = "";
              this.createCart();
              localStorage["cartId"] = "";
              this.paymentAmount = 0;
            }, 3000);
          }
        });
      },
      removePizzafromCart(pizzaId) {
        this.removePizza(pizzaId).then(() => {
          this.showCartData();
        });
      },

      saveHistory() {
      // alert("inside");
        let data = JSON.parse(localStorage.getItem("History"));
 this.showCartData();
      console.log(data);
      }
    };
  });
});
