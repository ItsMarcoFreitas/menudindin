const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkOutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");

let cart = [];

//abrir o modal do carrinho
cartBtn.addEventListener("click", function () {
  updateCartModal();
  cartModal.style.display = "flex";
});

// Fechar o modal quando clicar fora

cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

closeModalBtn.addEventListener("click", function () {
  cartModal.style.display = "none";
});

menu.addEventListener("click", function (event) {
  //console.log(event.target)
  let parentButton = event.target.closest(".add-to-cart-btn");
  console.log(parentButton);
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));
    addToCart(name, price);
  }
});

// Funcção para adicionar no carrinho
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    //se o item já existe, aumenta apenas a quantidade +1
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  updateCartModal();
}

//Atualiza o carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add(
      "flex",
      "justify-between",
      "mb-4",
      "flex-col"
    );

    cartItemElement.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
            <p class="font-bold">${item.name}<p>
            <p>Qtd: ${item.quantity}<p>
            <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}<p>
            </div>

           
            <button class="remove-from-cart-btn" data-name="${item.name}">
                Remover
            <button>
            
        </div>
    `;

    total += item.price * item.quantity;

    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-Br", {
    style: "currency",
    currency: "BRL",
  });

  cartCounter.innerHTML = cart.length;
}

// Função para remover o item do carrinho
cartItemsContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name");

    removeItemCart(name);
  }
});

function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);
  if (index !== -1) {
    const item = cart[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

addressInput.addEventListener("input", function (event) {
  let inputValue = event.target.value;

  if (inputValue !== "") {
    addressInput.classList.remove("border-red-500");
    addressWarn.classList.add("hidden");
  }
});

// Seleciona os elementos necessários
const dinheiroRadio = document.getElementById("dinheiro");
const changeContainer = document.getElementById("change-container");
const paymentMethods = document.querySelectorAll(
  'input[name="payment-method"]'
);

// Mostra a caixa de texto se "Dinheiro" for selecionado
dinheiroRadio.addEventListener("change", () => {
  if (dinheiroRadio.checked) {
    changeContainer.classList.remove("hidden"); // Exibe a caixa
  }
});

// Esconde a caixa de texto para outros métodos de pagamento
paymentMethods.forEach((method) => {
  method.addEventListener("change", () => {
    if (method.id !== "dinheiro") {
      changeContainer.classList.add("hidden"); // Esconde a caixa
    }
  });
});

// Finalizar pedido
checkOutBtn.addEventListener("click", function () {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "Ops, estamos fechados no momento",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#ef4444",
      },
    }).showToast();
    return;
  }

  if (cart.length === 0) {
    alert("O seu carrinho está vazio!");
    return;
  }

  if (addressInput.value === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  // Captura a forma de pagamento selecionada
  const selectedPaymentMethod = document.querySelector(
    'input[name="payment-method"]:checked'
  );

  // Verifica se o pagamento foi selecionado
  if (!selectedPaymentMethod) {
    alert("Por favor, selecione uma forma de pagamento.");
    return;
  }

  const paymentMethod = selectedPaymentMethod.value; // Pode ser 'Pix', 'Cartão de Crédito' ou 'Cartão de Débito'

  let changeFor = "";
  if (paymentMethod === "dinheiro") {
    const changeInput = document.getElementById("change-input").value.trim();

    if (changeInput === "") {
      alert("Por favor, informe o valor para o troco.");
      return;
    }

    changeFor = `Troco para: R$ ${parseFloat(changeInput).toFixed(2)}`;
  }

  // Enviar o pedido para a API do WhatsApp
  const cartItems = cart
    .map((item) => {
      return `\n- ${item.name}\n\nQuantidade: (${item.quantity}) Preço: R$${item.price}`;
    })
    .join("\n");

  // Calcular o total do carrinho
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Criar a mensagem do pedido
  const message = encodeURIComponent(
    `Olá, gostaria de fazer o pedido:\n\n${cartItems}\n\nTotal: R$ ${totalPrice.toFixed(
      2
    )}\n\nEndereço: ${
      addressInput.value
    }\n\nForma de pagamento: ${paymentMethod}${
      changeFor ? `\n\n${changeFor}` : ""
    }`
  );
  const phone = "+5583981033326";

  // Enviar o pedido via WhatsApp
  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

  // Limpar o carrinho
  cart = [];
  updateCartModal();
});

// Função para ver a hora e manipular a cor

function checkRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 12 && hora < 18;
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-500");
} else {
  spanItem.classList.remove("bg-green-500");
  spanItem.classList.add("bg-red-500");
}
