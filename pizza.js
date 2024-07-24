document.addEventListener("alpine:init", () => {
  Alpine.data("pizzaCart", () => {
    return {
      history: [],
      showHistory: false,
      pizzas: [],
      username: "",
      cartId: "",
      cartPizzas: [],
      showCart: false,
      cartTotal: 0.0,
      paymentAmount: "",
      message: "",
      featuredPizzas: [],
      pizzaId: 0,
      cartData: [],
      cartsData: [],
      carts: [],

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
          this.createCart();
          this.showCartData();
        }
        this.showCartData();
        console.log(this.getFeaturedPizzas());

        this.saveHistory();
      },

      addPizzaToCart(pizzaId) {
        this.addPizza(pizzaId).then(() => {
          this.showCartData();
        });
      },
      payForCart() {
        this.pay(this.paymentAmount).then((result) => {
          if (result.data.status == "failure") {
            this.message = result.data.message;
            setTimeout(() => (this.message = ""), 3000);
          } else {
            this.message = "Payment Recieved!";
            this.startConfetti();
            this.saveHistory();
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
        axios
          .get(
            `https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.username}`
          )
          .then((res) => {
            const carts = res.data;
            carts.forEach((cart) => {
              if (cart.status == "paid") {
                const cartCode = cart.cart_code;
                axios
                  .get(
                    `https://pizza-api.projectcodex.net/api/pizza-cart/${cartCode}/get`
                  )
                  .then((res) => {
                    const cartsData = res.data;
                    console.log("cart Data:", cartsData);
                    this.history.push(cartsData);
                  });
              }
            });
          });
      },
    };
  });
});
