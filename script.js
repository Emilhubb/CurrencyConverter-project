const box1 = document.querySelector(".box1");
const box2 = document.querySelector(".box2");
const curInput1 = document.querySelector(".cur-input-1");
const curInput2 = document.querySelector(".cur-input-2");
const leftButtons = document.querySelectorAll(".box1 button");
const rightButtons = document.querySelectorAll(".box2 button");
const rightratebox = document.getElementById("rightratebox");
const leftratebox = document.getElementById("leftratebox");
const changeBtn = document.querySelector(".fa-retweet");

let selectedBaseCurrency = "RUB";
let selectedTargetCurrency = "USD";

let currentRate = null;
const API_KEY = `a557eef4f1ab9e92bc9d69c3`;

document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector(".lists").classList.toggle("show");
});

let isOnline = navigator.onLine;
let lastConversion = null;
const connectionStatus = document.getElementById("connection-status");

window.addEventListener("offline", () => {
  isOnline = false;
  connectionStatus.textContent = "Нет подключения к интернету";
  connectionStatus.classList.remove("online");
  connectionStatus.style.display = "block";
});

window.addEventListener("online", () => {
  isOnline = true;

  connectionStatus.textContent = "Интернет подключен";
  connectionStatus.classList.add("online");
  connectionStatus.style.display = "block";
  
  setTimeout(() => {
    connectionStatus.style.display = "none";
  }, 2000);

  if (lastConversion === "input1") {
    convertFirstInput();
  } else if (lastConversion === "input2") {
    convertSecondInput();
  }
});

const setActiveButton = () => {
  leftButtons.forEach((button) => {
    if (button.textContent === selectedBaseCurrency) {
      button.classList.add("activeButton");
    } else {
      button.classList.remove("activeButton");
    }
  });

  rightButtons.forEach((button) => {
    if (button.textContent === selectedTargetCurrency) {
      button.classList.add("activeButton");
    } else {
      button.classList.remove("activeButton");
    }
  });
};

const fetchRate = async (leftCurrency, rightCurrency) => {
  if (leftCurrency === rightCurrency) {
    leftratebox.textContent = `1 ${leftCurrency} = 1 ${rightCurrency}`;
    rightratebox.textContent = `1 ${rightCurrency} = 1 ${leftCurrency}`;
    curInput2.value = curInput1.value;
    return 1;
  }

  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${selectedBaseCurrency}/${selectedTargetCurrency}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const rate = data["conversion_rate"];
    console.log("Fetched Rate:", rate);
    console.log("Fetched data:", data);

    if (rate) {
      currentRate = rate;
      return rate;
    } else {
      console.log("No rate found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching rate:", error);
    return null;
  }
};

const calculateResult = (inputVal, rate) => {
  console.log(inputVal);
  return inputVal * rate;
};

let BaseToTarget;

const convertFirstInput = async () => {
  BaseToTarget = true;
  handleInput(curInput1);
  lastConversion = "input1";
  if (!isOnline) {
    if (selectedBaseCurrency === selectedTargetCurrency) {
      curInput2.value = curInput1.value;
    }
    return;
  }

  if (curInput1.value.trim() === "") {
    curInput2.value = "";
    leftratebox.textContent = "";
    rightratebox.textContent = "";
    return;
  }
  if (selectedBaseCurrency === selectedTargetCurrency) {
    curInput2.value = curInput1.value;
    leftratebox.textContent = `1 ${selectedBaseCurrency} = 1 ${selectedTargetCurrency}`;
    rightratebox.textContent = `1 ${selectedTargetCurrency} = 1 ${selectedBaseCurrency}`;
    return;
  } else {
  }

  const rate = await fetchRate(selectedBaseCurrency, selectedTargetCurrency);
  if (rate !== null) {
    if (BaseToTarget) {
      const inputVal = parseFloat(curInput1.value) || 0;
      if (!isNaN(inputVal) && currentRate !== null) {
        const result = calculateResult(inputVal, rate);
        curInput2.value = result.toFixed(4);
      }
      const fixedResult = rate.toFixed(5);
      const reversed = (1 / rate).toFixed(5);
      leftratebox.textContent = `1 ${selectedBaseCurrency} = ${fixedResult} ${selectedTargetCurrency}`;
      rightratebox.textContent = `1 ${selectedTargetCurrency} = ${reversed} ${selectedBaseCurrency}`;
    }
  }
};
const convertSecondInput = async () => {
  BaseToTarget = false;
  handleInput(curInput2);
  if (curInput2.value.trim() === "") {
    curInput1.value = "";
    leftratebox.textContent = "";
    rightratebox.textContent = "";
    return;
  }
  if (selectedTargetCurrency === selectedBaseCurrency) {
    curInput1.value = curInput2.value;
    leftratebox.textContent = `1 ${selectedBaseCurrency} = 1 ${selectedTargetCurrency}`;
    rightratebox.textContent = `1 ${selectedTargetCurrency} = 1 ${selectedBaseCurrency}`;
    return;
  }

  const rate = await fetchRate(selectedTargetCurrency, selectedBaseCurrency);
  if (rate !== null) {
    if (!BaseToTarget) {
      const inputValue = parseFloat(curInput2.value);
      if (!isNaN(inputValue)) {
        const result = calculateResult(inputValue, rate);
        curInput1.value = result.toFixed(4);
      }
      const fixedResult = rate.toFixed(5);
      const reversed = (1 / rate).toFixed(5);
      leftratebox.textContent = `1 ${selectedBaseCurrency} = ${reversed} ${selectedTargetCurrency}`;
      rightratebox.textContent = `1 ${selectedTargetCurrency} = ${fixedResult} ${selectedBaseCurrency}`;
    }
  }
};

const handleInputEvent = (e) => {
  if (e.target === curInput1) {
    BaseToTarget = true;
    handleInput(curInput1);
    convertFirstInput();
  } else if (e.target === curInput2) {
    BaseToTarget = false;
    handleInput(curInput2);
    convertSecondInput();
  }
};

curInput1.addEventListener("input", handleInputEvent);
curInput2.addEventListener("input", handleInputEvent);

leftButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (selectedBaseCurrency !== button.textContent) {
      selectedBaseCurrency = button.textContent;
      setActiveButton();
      if (BaseToTarget) {
        convertFirstInput();
      } else {
        convertSecondInput();
      }
    }
  });
});

rightButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (selectedTargetCurrency !== button.textContent) {
      selectedTargetCurrency = button.textContent;
      setActiveButton();
      if (BaseToTarget === false) {
        convertSecondInput();
      } else {
        convertFirstInput();
      }
    }
  });
});
const handleInput = (input) => {
  console.log(input.value);
  let val = input.value;

  val = val.replace(/,/g, ".");

  let cleaned = val
    .split("")
    .filter((char) => (char >= "0" && char <= "9") || char === ".")
    .join("");

  if (cleaned.includes(".")) {
    let parts = cleaned.split(".");
    if (parts.length > 2) {
      parts = [parts[0], parts.slice(1).join("")];
    }

    if (parts[1] && parts[1].length > 5) {
      parts[1] = parts[1].slice(0, 5);
    }

    cleaned = parts.join(".");
  }

  if (cleaned === "") {
    input.value = "";
    return;
  }

  if (cleaned === ".") {
    input.value = "0.";
    return;
  }

  if (cleaned === "0") {
    input.value = "0";
    return;
  }

  if (cleaned !== "0" && !cleaned.startsWith("0")) {
    while (cleaned.startsWith("0") && cleaned.length > 1) {
      cleaned = cleaned.slice(1);
    }
  }

  if (cleaned.startsWith("0.") && cleaned.length > 2) {
    input.value = cleaned;
    return;
  }
  if (cleaned.startsWith("0") && !cleaned.startsWith("0.") && cleaned.length > 1) {
    if (cleaned[1] >= "1" && cleaned[1] <= "9") {
      cleaned = "0." + cleaned.slice(1);
    } else {
      cleaned = "0";
    }
  }

  input.value = cleaned;
};
